'use client';

import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { client } from '@/lib/apollo-client';
import { GET_PWB_BRANDS } from '@/queries/brands';

// ——— GQL ———
// Kategorije sa jednim nivoom children da bismo otvorili podkategorije u draweru
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

// ——— Types ———
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

export default function ProductMenuDrawer() {
  const [open, setOpen] = useState(false);

  // Kategorije (root + children)
  const { data: catData, loading: catLoading, error: catError } = useQuery<{
    productCategories: { nodes: Cat[] }
  }>(GET_CATEGORIES_TREE, {
    client,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  // Brendovi (PWB)
  const { data: brandData, loading: brandLoading, error: brandError } = useQuery<{
    pwbBrands: { nodes: PwbBrandNode[] }
  }>(GET_PWB_BRANDS, {
    client,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const categories = catData?.productCategories?.nodes ?? [];

  // Normalizuj brendove (fallback ime na slug, dedupe po slugu, sort A-Z)
  const brands = Object
    .values(
      (brandData?.pwbBrands?.nodes ?? [])
        .filter((b) => b && b.slug)
        .map((b) => ({
          id: b.id || b.slug,
          name: (b.name?.trim() || b.slug).trim(),
          slug: b.slug,
          count: b.count ?? 0,
        }))
        .reduce<Record<string, { id: string; name: string; slug: string; count: number }>>((acc, b) => {
          const exist = acc[b.slug];
          if (!exist || (b.count || 0) > (exist.count || 0)) acc[b.slug] = b;
          return acc;
        }, {})
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'sr'));

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen(true)}
        className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-lg"
        aria-label="Otvori meni"
      >
        <FiMenu size={24} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="fixed top-0 right-0 w-80 h-full bg-neutral-900 text-white p-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Meni</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-neutral-400 hover:text-white"
                  aria-label="Zatvori meni"
                >
                  <FiX size={28} />
                </button>
              </div>

              {/* SORTIRANJE (isti linkovi kao SSR sidebar) */}
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Sortiranje</h3>
                <nav className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Cena ↑', value: 'price_asc' },
                    { label: 'Cena ↓', value: 'price_desc' },
                    { label: 'Najnovije', value: 'date_desc' },
                    { label: 'Najstarije', value: 'date_asc' },
                    { label: 'Naziv A-Z', value: 'name_asc' },
                    { label: 'Naziv Z-A', value: 'name_desc' },
                  ].map((s) => (
                    <Link
                      key={s.value}
                      href={{ pathname: '/products', query: { sort: s.value } }}
                      onClick={() => setOpen(false)}
                      className="rounded border border-white/10 px-2 py-1 text-sm text-neutral-300 hover:text-white hover:border-white/20 transition"
                    >
                      {s.label}
                    </Link>
                  ))}
                </nav>
              </section>

              {/* KATEGORIJE */}
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Kategorije</h3>
                {catLoading && <p className="text-neutral-400 text-sm">Učitavanje…</p>}
                {catError && <p className="text-red-400 text-sm">Greška pri učitavanju kategorija.</p>}

                <nav className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <Link
                        href={`/categories/${cat.slug}`}
                        onClick={() => setOpen(false)}
                        className="block text-lg hover:text-blue-400 transition"
                      >
                        {cat.name}
                      </Link>

                      {!!cat.children?.nodes?.length && (
                        <div className="mt-1 ml-3 space-y-2">
                          {cat.children.nodes.map((sc) => (
                            <Link
                              key={sc.id}
                              href={`/categories/${cat.slug}/${sc.slug}`}
                              onClick={() => setOpen(false)}
                              className="block text-sm text-neutral-400 hover:text-neutral-200"
                            >
                              {sc.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {!catLoading && !catError && categories.length === 0 && (
                    <p className="text-neutral-400 text-sm">Nema kategorija.</p>
                  )}
                </nav>
              </section>

              {/* BRENDOVI (PWB) */}
              <section>
                <h3 className="text-xl font-semibold mb-3">Brendovi</h3>
                {brandLoading && <p className="text-neutral-400 text-sm">Učitavanje…</p>}
                {brandError && <p className="text-neutral-400 text-sm">Nije moguće učitati brendove.</p>}

                <nav className="space-y-3 max-h-[40vh] overflow-auto pr-1">
                  {brands.map((b) => (
                    <Link
                      key={b.id}
                      href={{ pathname: '/products', query: { brand: b.slug } }}
                      onClick={() => setOpen(false)}
                      className="block text-lg hover:text-blue-400 transition"
                    >
                      {b.name}
                      {b.count ? <span className="text-neutral-500"> ({b.count})</span> : null}
                    </Link>
                  ))}
                  {!brandLoading && !brandError && brands.length === 0 && (
                    <p className="text-neutral-400 text-sm">Nema brendova.</p>
                  )}
                </nav>
              </section>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}