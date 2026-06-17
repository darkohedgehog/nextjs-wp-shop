import Link from "next/link";
import type { ShopMenuBrand, ShopMenuCategory } from "@/lib/shop-menu-data";

type SearchParams = Record<string, string | string[] | undefined>;

function isPromise<T>(v: unknown): v is Promise<T> {
  return typeof v === "object" && v !== null && "then" in v;
}

async function resolveSearchParams(
  params?: SearchParams | Promise<SearchParams>
): Promise<SearchParams> {
  if (!params) return {};
  if (isPromise<SearchParams>(params)) return await params;
  return params;
}

// helper: pretvori Record u plain query obj (string -> string)
function toQ(params: SearchParams) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") out[k] = v;
    else if (Array.isArray(v) && v.length) out[k] = v[0] ?? "";
  }
  return out;
}

// helper: merge-uj postojeće parametre sa novima (i očisti prazne)
function mergedQuery(base: Record<string, string>, add: Record<string, string | undefined>) {
  const next: Record<string, string> = { ...base };

  for (const [k, v] of Object.entries(add)) {
    if (v == null || v === "") delete next[k];
    else next[k] = v;
  }

  // reset paginacije kad menjaš filter/sort:
  delete next.after;

  return next;
}

export default async function ProductMenuSSR({
  searchParams,
  categories,
  brands,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
  categories: ShopMenuCategory[];
  brands: ShopMenuBrand[];
}) {
  const resolvedParams = await resolveSearchParams(searchParams);

  // 0) trenutni query (da bismo zadržali brand ili sort pri klikanju)
  const currentQ = toQ(resolvedParams);
  const activeSort = currentQ.sort || "";
  const activeBrand = currentQ.brand || "";

  const sortLinks = [
    { label: "Cijena ↑", value: "price_asc" },
    { label: "Cijena ↓", value: "price_desc" },
    { label: "Najnovije", value: "date_desc" },
    { label: "Najstarije", value: "date_asc" },
    { label: "Naziv A–Z", value: "name_asc" },
    { label: "Naziv Z–A", value: "name_desc" },
  ];

  return (
    <div className="sticky top-6 space-y-8 rounded-xl border border-white/10 bg-neutral-900/20 p-5">
      {/* SORT */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-blue-400">Sortiranje</h3>
        <nav className="grid grid-cols-2 gap-2">
          {sortLinks.map((s) => {
            const href = {
              pathname: "/products",
              query: mergedQuery(currentQ, { sort: s.value }),
            };
            const isActive = activeSort === s.value;

            return (
              <Link
                key={s.value}
                href={href}
                className={[
                  "rounded border px-2 py-1 text-sm transition",
                  isActive
                    ? "border-white/40 text-zinc-200"
                    : "border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>
      </section>

      {/* KATEGORIJE */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-blue-400">Kategorije</h3>
        {categories.length ? (
          <nav className="space-y-2">
            {categories.map((c) => (
              <div key={c.id}>
                <Link
                  href={`/categories/${c.slug}`}
                  className="block secondary-color hover:text-white transition"
                >
                  {c.name}
                </Link>

                {!!c.children?.nodes?.length && (
                  <div className="mt-1 ml-3 space-y-1">
                    {c.children.nodes.map((sc) => (
                      <Link
                        key={sc.id}
                        href={`/categories/${c.slug}/${sc.slug}`}
                        className="block text-sm text-blue-300 hover:text-neutral-200"
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
          <p className="text-neutral-400 text-sm flex items-center justify-center">
            Nema tražene kategorije
          </p>
        )}
      </section>

      {/* BRENDOVI */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-blue-400">Proizvođač</h3>
        {brands.length ? (
          <nav className="max-h-[40vh] overflow-auto pr-1 space-y-2">
            {brands.map((b) => {
              const href = {
                pathname: "/products",
                query: mergedQuery(currentQ, { brand: b.slug }),
              };
              const isActive = activeBrand === b.slug;

              return (
                <Link
                  key={b.id}
                  href={href}
                  className={[
                    "block transition",
                    isActive ? "text-blue-300" : "text-blue-300 hover:text-white",
                  ].join(" ")}
                  aria-current={isActive ? "page" : undefined}
                >
                  {b.name}
                  {b.count ? <span className="text-neutral-500"> ({b.count})</span> : null}
                </Link>
              );
            })}
          </nav>
        ) : (
          <p className="text-neutral-400 text-sm">Nema brendova.</p>
        )}
      </section>
    </div>
  );
}
