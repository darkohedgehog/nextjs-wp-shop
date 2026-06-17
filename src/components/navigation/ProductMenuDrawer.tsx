'use client';

import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { ShopMenuBrand, ShopMenuCategory } from '@/lib/shop-menu-data';

type ProductMenuDrawerProps = {
  categories: ShopMenuCategory[];
  brands: ShopMenuBrand[];
};

export default function ProductMenuDrawer({ categories, brands }: ProductMenuDrawerProps) {
  const [open, setOpen] = useState(false);

  // helper da zatvori meni posle navigacije
  const handleLinkClick = () => setOpen(false);

  return (
    // root samo drži dugme – z-index ovde nije presudan kad već dajemo veći na overlay/aside
    <div className="relative lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="text-zinc-200 bg-primary-color p-2 rounded-lg"
        aria-label="Otvori meni"
      >
        <FiMenu size={24} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP — sada sa većim z-indexom da bude iznad glavnog menija */}
            <motion.div
              className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* DRAWER — full height, flex kolona, sadržaj skroluje */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="
                fixed mt-24 inset-y-0 right-0 z-70
                w-80 max-w-full
                bg-neutral-900/60 text-white shadow-2xl
                flex flex-col
              "
              role="dialog"
              aria-modal="true"
            >
              {/* HEADER (ne skroluje) */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 shrink-0">
                <button
                  onClick={() => setOpen(false)}
                  className="paragraph-color hover:text-zinc-100"
                  aria-label="Zatvori meni"
                >
                  <FiX size={28} />
                </button>
              </div>

              {/* BODY (skroluje) */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">
                {/* SORTIRANJE (isti linkovi kao SSR sidebar) */}
                <section>
                  <h3 className="text-xl font-semibold mb-3 text-blue-400">Sortiranje</h3>
                  <nav className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Cijena ↑', value: 'price_asc' },
                      { label: 'Cijena ↓', value: 'price_desc' },
                      { label: 'Najnovije', value: 'date_desc' },
                      { label: 'Najstarije', value: 'date_asc' },
                      { label: 'Naziv A-Z', value: 'name_asc' },
                      { label: 'Naziv Z-A', value: 'name_desc' },
                    ].map((s) => (
                      <Link
                        key={s.value}
                        href={{ pathname: '/products', query: { sort: s.value } }}
                        onClick={handleLinkClick}
                        className="rounded border border-white/40 px-2 py-1 text-sm text-zinc-200 hover:text-zinc-100 hover:border-white/20 transition"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </nav>
                </section>

                {/* KATEGORIJE */}
                <section>
                  <h3 className="text-xl font-semibold mb-3 text-blue-400">Kategorije</h3>

                  <nav className="space-y-3 secondary-color">
                    {categories.map((cat) => (
                      <div key={cat.id}>
                        <Link
                          href={`/categories/${cat.slug}`}
                          onClick={handleLinkClick}
                          className="block text-lg hover:text-blue-400 transition"
                        >
                          {cat.name}
                        </Link>

                        {!!cat.children?.nodes?.length && (
                          <div className="mt-1 ml-3 space-y-2 primary-color">
                            {cat.children.nodes.map((sc) => (
                              <Link
                                key={sc.id}
                                href={`/categories/${cat.slug}/${sc.slug}`}
                                onClick={handleLinkClick}
                                className="block text-sm hover:text-neutral-300"
                              >
                                {sc.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {categories.length === 0 && (
                      <p className="text-neutral-400 text-sm flex items-center justify-center">
                        Nema kategorija...
                        </p>
                    )}
                  </nav>
                </section>

                {/* BRENDOVI (PWB) */}
                <section>
                  <h3 className="text-xl font-semibold mb-3 text-blue-400">Proizvođač</h3>

                  <nav className="space-y-3 secondary-color">
                    {brands.map((b) => (
                      <Link
                        key={b.id}
                        href={{ pathname: '/products', query: { brand: b.slug } }}
                        onClick={handleLinkClick}
                        className="block text-lg hover:text-blue-400 transition"
                      >
                        {b.name}
                        {b.count ? (
                          <span className="text-neutral-500"> ({b.count})</span>
                        ) : null}
                      </Link>
                    ))}
                    {brands.length === 0 && (
                      <p className="text-neutral-400 text-sm">Nema proizvođača...</p>
                    )}
                  </nav>
                </section>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
