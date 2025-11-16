'use client';

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react'; // za @apollo/client 4.0.7
import Link from 'next/link';
import Image from 'next/image';
import he from 'he';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShineBorder } from '../ui/shine-border';
import ProductMenuDrawer from '../navigation/ProductMenuDrawer';
import { FaSearchengin } from "react-icons/fa";

// ——— Types ———
type Brand = { name?: string | null; slug?: string | null };

interface Product {
  databaseId?: number;
  id: string | number;
  name: string;
  slug: string;
  description?: string | null;
  date?: string | null; // ⬅️ za sortiranje po datumu
  price?: string | null; // SimpleProduct
  image?: { sourceUrl: string; altText?: string | null } | null; // SimpleProduct
  terms?: { nodes?: Brand[] } | null; // PWB_BRAND termini
}

interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}
interface ProductsData {
  products: { pageInfo: PageInfo; nodes: Product[] };
}
interface Vars {
  search?: string;
  category?: string[];
  after?: string | null;
}

// ——— GQL ———
// Uzimamo terms (PWBBRAND) za sve tipove proizvoda, a price/image na SimpleProduct.
// Dodata je i 'date' da bi sortiranje po datumu bilo smisleno.
const GET_PRODUCTS = gql`
  query GetProducts($search: String, $category: [String], $after: String) {
    products(first: 12, after: $after, where: { search: $search, categoryIn: $category }) {
      pageInfo { endCursor hasNextPage }
      nodes {
        databaseId
        id
        name
        slug
        description

        # ⬇️ datum tražimo preko interfejsa
        ... on Product {
          date
        }

        # price / image su samo na SimpleProduct
        ... on SimpleProduct {
          price
          image { sourceUrl altText }
        }

        # PWB brend termini — za sve tipove
        ... on SimpleProduct {
          terms(first: 10, where: { taxonomies: [PWBBRAND] }) {
            nodes { __typename ... on PwbBrand { name slug } ... on TermNode { name slug } }
          }
        }
        ... on VariableProduct {
          terms(first: 10, where: { taxonomies: [PWBBRAND] }) {
            nodes { __typename ... on PwbBrand { name slug } ... on TermNode { name slug } }
          }
        }
        ... on ExternalProduct {
          terms(first: 10, where: { taxonomies: [PWBBRAND] }) {
            nodes { __typename ... on PwbBrand { name slug } ... on TermNode { name slug } }
          }
        }
        ... on GroupProduct {
          terms(first: 10, where: { taxonomies: [PWBBRAND] }) {
            nodes { __typename ... on PwbBrand { name slug } ... on TermNode { name slug } }
          }
        }
      }
    }
  }
`;

// ——— Helpers ———
function dedupeProducts(list: Product[]): Product[] {
  const map = new Map<string | number, Product>();
  for (const p of list) {
    const key = p.databaseId ?? `${p.id}:${p.slug}`;
    if (!map.has(key)) map.set(key, p);
  }
  return Array.from(map.values());
}

function productKey(p: Product): string {
  return String(p.databaseId ?? `${p.id}:${p.slug}`);
}

function getBrandSlugList(p: Product): string[] {
  return (p?.terms?.nodes ?? [])
    .map((t) => (t?.slug ?? '').trim().toLowerCase())
    .filter(Boolean);
}
function getBrandName(p: Product): string | null {
  const found = (p?.terms?.nodes ?? []).find((t) => (t?.name ?? '').trim().length > 0);
  return found?.name ?? null;
}
function matchesBrand(p: Product, desiredSlug: string | null): boolean {
  if (!desiredSlug) return true;
  const want = desiredSlug.trim().toLowerCase();
  return getBrandSlugList(p).includes(want);
}

// price parser: "1.299,00 €" / "60,00&nbsp;€" → 1299.00 / 60.00
function parsePriceToNumber(price?: string | null): number | null {
  if (!price) return null;
  const decoded = he.decode(price);
  // pokupi prvi broj sa zarez/tačka varijacijama
  const match = decoded.replace(/\s/g, '').match(/[\d.,]+/);
  if (!match) return null;
  let n = match[0];

  // heuristic: ako sadrži i '.' i ',', onda '.' je hiljadarka, ',' je decimalna
  if (n.includes('.') && n.includes(',')) {
    n = n.replace(/\./g, '').replace(',', '.');
  } else if (n.includes(',')) {
    // ako ima samo ',', tretiraj je kao decimalni separator
    n = n.replace(',', '.');
  }
  const num = Number(n);
  return Number.isFinite(num) ? num : null;
}

// sortiranje
type SortKey = 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | '';
function sortProducts(list: Product[], sort: SortKey): Product[] {
  const arr = [...list];
  switch (sort) {
    case 'price_asc':
      return arr.sort((a, b) => (parsePriceToNumber(a.price) ?? Infinity) - (parsePriceToNumber(b.price) ?? Infinity));
    case 'price_desc':
      return arr.sort((a, b) => (parsePriceToNumber(b.price) ?? -Infinity) - (parsePriceToNumber(a.price) ?? -Infinity));
    case 'date_asc':
      return arr.sort((a, b) => (Date.parse(a.date ?? '1970-01-01') - Date.parse(b.date ?? '1970-01-01')));
    case 'date_desc':
      return arr.sort((a, b) => (Date.parse(b.date ?? '1970-01-01') - Date.parse(a.date ?? '1970-01-01')));
    case 'name_asc':
      return arr.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'sr', { sensitivity: 'base' }));
    case 'name_desc':
      return arr.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'sr', { sensitivity: 'base' }));
    default:
      return arr;
  }
}

export default function ProductListClient({
  initialProducts,
  initialPageInfo,
  initialSearch,
}: {
  initialProducts: Product[];
  initialPageInfo: PageInfo;
  initialSearch: string;
}) {
  const searchParams = useSearchParams();

  // direktno, bez useMemo:
  const brandParamRaw = searchParams.get('brand');
  const brandParam = brandParamRaw ? decodeURIComponent(brandParamRaw).trim().toLowerCase() : null;

  const sortParamRaw = (searchParams.get('sort') || '') as SortKey;

  // ——— State ———
  const [searchTerm, setSearchTerm] = useState(initialSearch ?? '');
  const [products, setProducts] = useState<Product[]>(
    sortProducts(
      dedupeProducts((initialProducts ?? []).filter((p) => matchesBrand(p, brandParam))),
      sortParamRaw,
    )
  );
  const [pageInfo, setPageInfo] = useState<PageInfo>(
    initialPageInfo ?? { endCursor: null, hasNextPage: false }
  );

  // ——— Query ———
  const { data, loading, error, fetchMore, refetch, networkStatus } =
    useQuery<ProductsData, Vars>(GET_PRODUCTS, {
      variables: {
        search: initialSearch || undefined,
        category: undefined,
        after: null,
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    });

  // ——— Sync incoming data + brand filter + sort ———
  useEffect(() => {
    if (data?.products) {
      const base = dedupeProducts(data.products.nodes);
      const filtered = base.filter((p) => matchesBrand(p, brandParam));
      const sorted = sortProducts(filtered, sortParamRaw);
      setProducts(sorted);
      setPageInfo(data.products.pageInfo);
    }
    // reaguj i na promenu sort/brand u URL-u
  }, [data, brandParam, sortParamRaw]);

  // ——— Pagination ———
  const loadMore = async () => {
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) return;

    const res = await fetchMore({
      variables: {
        search: searchTerm || undefined,
        category: undefined,
        after: pageInfo.endCursor,
      },
    });

    const next = (res?.data as ProductsData | undefined)?.products;
    if (next) {
      const merged = dedupeProducts([...products, ...next.nodes]); // dedupe preko id/slug
      const filtered = merged.filter((p) => matchesBrand(p, brandParam));
      const sorted = sortProducts(filtered, sortParamRaw);
      setProducts(sorted);
      setPageInfo(next.pageInfo);
    }
  };

  // ——— Search submit ———
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await refetch({
      search: searchTerm || undefined,
      category: undefined,
      after: null,
    });

    const refreshed = (res.data as ProductsData | undefined)?.products;
    if (refreshed) {
      const base = dedupeProducts(refreshed.nodes);
      const filtered = base.filter((p) => matchesBrand(p, brandParam));
      const sorted = sortProducts(filtered, sortParamRaw);
      setProducts(sorted);
      setPageInfo(refreshed.pageInfo);
    } else {
      setProducts([]);
      setPageInfo({ endCursor: null, hasNextPage: false });
    }
  };

  // ——— UI ———
  return (
    <div className="p-4 mx-auto w-full flex flex-col items-center justify-center"> 
    <div className='flex items-center justify-center gap-4'>
    <ProductMenuDrawer />
      {/* Search */}
      <form onSubmit={handleSearch} className="my-4 flex gap-2 w-full max-w-xl mx-auto">
        <div className="relative flex-1">
          {/* INPUT */}
          <div className="relative z-20">
            <input
              type="text"
              placeholder="Pretraga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full p-3 rounded-xl
                bg-black/10 backdrop-blur
                outline-none caret-white text-white
                placeholder:text-neutral-300
                focus:ring-2 focus:ring-purple-400/50
              "
              style={{ WebkitTextFillColor: '#fff' }}
            />
          </div>
          {/* SHINE BORDER — samo vizuelni overlay, bez eventa */}
          <div className="pointer-events-none absolute inset-0 rounded-xl">
            <ShineBorder
              shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']}
              duration={14}
              borderWidth={2}
            />
          </div>
        </div>

        <button
          type="submit"
          className="shrink-0 bg-gradient-custom text-zinc-200 px-4 py-2 rounded-full active:scale-95 transition"
          aria-label="Pretraži proizvode"
        >
          <FaSearchengin />
        </button>
      </form>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-2 mt-6 gap-5 w-96 lg:w-full">
        {products.map((product) => {
          const brandName = getBrandName(product);
          return (
            <div key={productKey(product)} className="relative">
              {/* Dekorativni border panel (iza linka) */}
              <div className="pointer-events-none absolute inset-0 rounded-xl">
                <ShineBorder
                  shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']}
                  duration={14}
                  borderWidth={2}
                />
              </div>

              <Link
                href={`/products/${product.slug}`}
                className="relative z-10 block p-4 rounded-xl transition"
              >
                {product.image?.sourceUrl && (
                  <Image
                    width={400}
                    height={400}
                    src={product.image.sourceUrl}
                    alt={product.image.altText || product.name}
                    className="w-48 h-48 object-cover mb-2 mx-auto rounded-xl"
                  />
                )}

                <h2 className="text-md font-bold mb-1 mx-1 secondary-color">
                  {product.name}
                </h2>

                {brandName && (
                  <p className="text-xs text-zinc-400 mb-1 mx-1">
                    Proizvođač: <span className="text-zinc-200">{brandName}</span>
                  </p>
                )}

                {product.price && (
                  <p className="text-sm font-semibold mb-2 mx-1 text-fuchsia-300">
                    {he.decode(product.price).replace(/&nbsp;|\u00A0/g, '').trim()}
                  </p>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Pagination / status */}
      {pageInfo.hasNextPage && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            className="bg-gradient-custom text-zinc-200 px-6 py-2 rounded-xl disabled:opacity-50"
            disabled={loading || networkStatus === 3 /* refetch */}
          >
            {loading ? 'Učitavanje…' : 'Učitaj više...'}
          </button>
        </div>
      )}

      {loading && !products.length && (
        <p className="mt-4 text-center">Učitavanje…</p>
      )}
      {error && <p className="mt-4 text-red-600">Greška: {error.message}</p>}
      {!loading && !error && !products.length && (
        <p className="mt-4 text-center text-gray-400">Nema rezultata.</p>
      )}
    </div>
  );
}