import { client } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import he from 'he';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryProductsClient } from '@/components/categories/CategoryProductsClient';
import BackButton from '@/components/ui/BackButton';


// --- Tipovi podataka
type Category = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image?: { sourceUrl: string; altText?: string | null } | null;
  children: { nodes: Array<Category | null | undefined> };
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price?: string | null;
  image?: { sourceUrl: string; altText?: string | null } | null;
};

type ProductsData = {
  products?: {
    pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
    };
    nodes: Array<Product | null | undefined>;
  } | null;
};

type CategoryData = {
  productCategory?: Category | null;
};

type PageInfo = {
  endCursor: string | null;
  hasNextPage: boolean;
};

// GraphQL queries
const GET_CATEGORY_TREE = gql`
  query CategoryTree($slug: ID!) {
    productCategory(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      image { sourceUrl altText }
      children {
        nodes {
          id
          databaseId
          name
          slug
          image { sourceUrl altText }
        }
      }
    }
  }
`;

const GET_PRODUCTS_BY_CATEGORY = gql`
  query ProductsByCategory($categoryId: Int!, $after: String) {
    products(first: 24, after: $after, where: { categoryId: $categoryId }) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        id
        name
        slug
        ... on SimpleProduct {
          price
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

// util: pročisti cenu
function cleanPrice(raw?: string | null) {
  if (!raw) return '';
  return he.decode(raw).replace(/&nbsp;|\u00A0/g, '').trim();
}

export default async function CategorySlugPage({
  params,
}: {
  // 👇 u Next 15 / React 19 params je Promise
  params: Promise<{ slug?: string | string[] }>;
}) {
  // ⬇️ ovde ga "otvaramo"
  const resolved = await params;
  const slugInput = resolved.slug;

  // slug može biti string ili string[] – normalizuj u niz
  const slugArr = Array.isArray(slugInput)
    ? slugInput
    : slugInput
    ? [slugInput]
    : [];

  const parentSlug = slugArr[0] ?? null;
  const childSlug = slugArr[1] ?? null;

  if (!parentSlug) {
    return (
      <p className="p-4 max-w-5xl mx-auto text-sm paragraph-color text-center">
        Učitavanje…
      </p>
    );
  }

  // 1) Učitaj stablo kategorije po parent slugu
  const catRes = await client.query<CategoryData>({
    query: GET_CATEGORY_TREE,
    variables: { slug: parentSlug },
    context: {
      fetchOptions: {
        next: { revalidate: 300 },
        cache: 'force-cache',
      },
    },
  });

  const parentCat = catRes.data?.productCategory ?? null;

  if (!parentCat) {
    return (
      <p className="p-4 max-w-5xl mx-auto text-sm text-red-600 text-center">
        Kategorija nije pronađena.
      </p>
    );
  }

  const childNodes: Category[] = (parentCat.children?.nodes ?? []).filter(
    (c): c is Category => Boolean(c),
  );

  const currentCat: Category | null = childSlug
    ? childNodes.find((c) => c.slug === childSlug) || null
    : parentCat;

  if (!currentCat) {
    return (
      <p className="p-4 max-w-5xl mx-auto text-sm text-red-600 text-center">
        Podkategorija nije pronađena.
      </p>
    );
  }

  const showSubcategories = !childSlug && childNodes.length > 0;

    // 2) Ako je leaf (nema podkategorija ili smo na child-u) → fetch proizvode
    let products: Product[] = [];
    let initialPageInfo: PageInfo = { endCursor: null, hasNextPage: false };
  
    if (!showSubcategories) {
      const categoryId = currentCat.databaseId;
  
      const prodRes = await client.query<ProductsData>({
        query: GET_PRODUCTS_BY_CATEGORY,
        variables: { categoryId, after: null },
        context: {
          fetchOptions: {
            next: { revalidate: 300 },
            cache: 'force-cache',
          },
        },
      });
  
      const productsData = prodRes.data?.products;
      const nodes = productsData?.nodes ?? [];
      products = nodes.filter((p): p is Product => Boolean(p));
      initialPageInfo = productsData?.pageInfo ?? { endCursor: null, hasNextPage: false };
    }

  // 3) Render
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 secondary-color">{currentCat.name}</h1>

      {showSubcategories ? (
        // 👉 PODKATEGORIJE – isti UI kao na CategoriesPage.tsx
        <div className="grid grid-cols-2 lg:grid-cols-3 md:grid-cols-2 mt-6 gap-5 max-w-5xl mx-auto">
          {childNodes.map((sub) => (
            <ProductCard
              key={sub.id}
              href={`/categories/${parentSlug}/${sub.slug}`}
              name={sub.name}
              imageUrl={sub.image?.sourceUrl ?? parentCat.image?.sourceUrl ?? null}
              imageAlt={sub.image?.altText || sub.name}
              price={undefined}
              brandName={undefined}
            />
          ))}
        </div>
           ) : (
            <CategoryProductsClient
              initialProducts={products}
              initialPageInfo={initialPageInfo}
              categoryId={currentCat.databaseId}
            />
          )}
          <div>
            <BackButton />
          </div>
    </div>
  );
}