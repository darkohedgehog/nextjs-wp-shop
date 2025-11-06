// components/shop/ProductMenuSSR.tsx
import Link from 'next/link';
import { gql } from '@apollo/client';
import { client } from '@/lib/apollo-client';
import { GET_PWB_BRANDS } from '@/queries/brands';

export const revalidate = 600; // 10 min

// Kategorije + children (1 nivo)
const GET_CATEGORIES_TREE = gql`
  query GetCategoriesTree {
    productCategories(where: { parent: 0 }, first: 100) {
      nodes {
        id
        name
        slug
        children(first: 100) {
          nodes { id name slug }
        }
      }
    }
  }
`;

type Cat = {
  id: string;
  name: string;
  slug: string;
  children?: { nodes: { id: string; name: string; slug: string }[] } | null;
};

type PwbBrandNode = {
  id: string;
  name?: string | null;
  slug: string;
  count?: number | null;
};

// helper: pretvori Record u plain query obj (string -> string)
function toQ(params?: Record<string, string | string[] | undefined>) {
  const out: Record<string, string> = {};
  if (!params) return out;
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'string') out[k] = v;
    else if (Array.isArray(v) && v.length) out[k] = v[0]!;
  }
  return out;
}

// helper: merge-uj postojeće parametre sa novima (i očisti prazne)
function mergedQuery(
  base: Record<string, string>,
  add: Record<string, string | undefined>
) {
  const next: Record<string, string> = { ...base };
  for (const [k, v] of Object.entries(add)) {
    if (v == null || v === '') delete next[k];
    else next[k] = v;
  }
  // po želji resetuj paginaciju kad menjaš filter/sort:
  delete next.after;
  return next;
}

export default async function ProductMenuSSR({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  // 0) trenutni query (da bismo zadržali brand ili sort pri klikanju)
  const currentQ = toQ(searchParams);
  const activeSort = currentQ.sort || '';
  const activeBrand = currentQ.brand || '';

  // 1) Kategorije (SSR + keš)
  const { data: catData } = await client.query<{
    productCategories: { nodes: Cat[] }
  }>({
    query: GET_CATEGORIES_TREE,
    context: { fetchOptions: { next: { revalidate, cache: 'force-cache' } } },
  });

  // 2) Brendovi iz PWB (SSR + keš)
  const { data: brandData } = await client.query<{
    pwbBrands: { nodes: PwbBrandNode[] }
  }>({
    query: GET_PWB_BRANDS,
    context: { fetchOptions: { next: { revalidate, cache: 'force-cache' } } },
  });

  const categories = catData?.productCategories?.nodes ?? [];

  // Normalizacija + dedupe + sort
  const brandMap = (brandData?.pwbBrands?.nodes ?? [])
    .filter((b) => b && b.slug)
    .map((b) => ({
      id: b.id || b.slug,
      name: (b.name?.trim() || b.slug).trim(),
      slug: b.slug,
      count: b.count ?? 0,
    }))
    .filter((b) => b.name.length > 0)
    .reduce<Record<string, { id: string; name: string; slug: string; count: number }>>(
      (acc, b) => {
        const existing = acc[b.slug];
        if (!existing || (b.count || 0) > (existing.count || 0)) acc[b.slug] = b;
        return acc;
      },
      {},
    );
  const brandList = Object.values(brandMap).sort((a, b) =>
    a.name.localeCompare(b.name, 'sr', { sensitivity: 'base' })
  );

  // linkovi za sortiranje (isti ključ kao u ProductListClient)
  const sortLinks = [
    { label: 'Cena ↑', value: 'price_asc' },
    { label: 'Cena ↓', value: 'price_desc' },
    { label: 'Najnovije', value: 'date_desc' },
    { label: 'Najstarije', value: 'date_asc' },
    { label: 'Naziv A–Z', value: 'name_asc' },
    { label: 'Naziv Z–A', value: 'name_desc' },
  ];

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-6 space-y-8 rounded-xl border border-white/10 bg-neutral-900/40 p-5">

        {/* SORT */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Sortiranje</h3>
          <nav className="grid grid-cols-2 gap-2">
            {sortLinks.map((s) => {
              const href = {
                pathname: '/products',
                query: mergedQuery(currentQ, { sort: s.value }),
              };
              const isActive = activeSort === s.value;
              return (
                <Link
                  key={s.value}
                  href={href}
                  className={[
                    'rounded border px-2 py-1 text-sm transition',
                    isActive
                      ? 'border-white/40 text-white'
                      : 'border-white/10 text-neutral-300 hover:text-white hover:border-white/20',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {s.label}
                </Link>
              );
            })}
          </nav>
        </section>

        {/* KATEGORIJE */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Kategorije</h3>
          {categories.length ? (
            <nav className="space-y-2">
              {categories.map((c) => (
                <div key={c.id}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="block text-neutral-200 hover:text-white transition"
                  >
                    {c.name}
                  </Link>

                  {!!c.children?.nodes?.length && (
                    <div className="mt-1 ml-3 space-y-1">
                      {c.children.nodes.map((sc) => (
                        <Link
                          key={sc.id}
                          href={`/categories/${c.slug}/${sc.slug}`}
                          className="block text-sm text-neutral-400 hover:text-neutral-200"
                        >
                          {sc.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          ) : (
            <p className="text-neutral-400 text-sm">Nema kategorija.</p>
          )}
        </section>

        {/* BRENDOVI */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Brendovi</h3>
          {brandList.length ? (
            <nav className="max-h-[40vh] overflow-auto pr-1 space-y-2">
              {brandList.map((b) => {
                const href = {
                  pathname: '/products',
                  query: mergedQuery(currentQ, { brand: b.slug }),
                };
                const isActive = activeBrand === b.slug;
                return (
                  <Link
                    key={b.id}
                    href={href}
                    className={[
                      'block transition',
                      isActive
                        ? 'text-white'
                        : 'text-neutral-300 hover:text-white',
                    ].join(' ')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {b.name}
                    {b.count ? (
                      <span className="text-neutral-500"> ({b.count})</span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <p className="text-neutral-400 text-sm">Nema brendova.</p>
          )}
        </section>
      </div>
    </aside>
  );
}