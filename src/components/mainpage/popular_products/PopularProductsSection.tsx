import Link from "next/link";
import { client } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { ProductCard } from "@/components/product/ProductCard";

// 1) Query za kategoriju po slugu
const GET_CATEGORY_BY_SLUG = gql`
  query CategoryBySlug($slug: ID!) {
    productCategory(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
    }
  }
`;

// 2) Query za 4 proizvoda iz konkretne kategorije
const GET_POPULAR_PRODUCTS = gql`
  query PopularProductsByCategory($categoryId: Int!) {
    products(
      first: 4
      where: {
        categoryId: $categoryId
        orderby: { field: DATE, order: DESC }
      }
    ) {
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

type CategoryBySlugData = {
  productCategory?: {
    id: string;
    databaseId: number;
    name: string;
    slug: string;
  } | null;
};

type PopularProductsData = {
  products?: {
    nodes: {
      id: string;
      name: string;
      slug: string;
      price?: string | null;
      image?: {
        sourceUrl: string;
        altText?: string | null;
      } | null;
    }[];
  } | null;
};

const POPULAR_CATEGORY_SLUG = "najpopularniji-proizvodi";

export default async function PopularProductsSection() {
  // 1) Uzmi kategoriju po slugu
  const { data: catData } = await client.query<CategoryBySlugData>({
    query: GET_CATEGORY_BY_SLUG,
    variables: { slug: POPULAR_CATEGORY_SLUG },
    context: {
      fetchOptions: {
        next: { revalidate: 300 },
        cache: "force-cache",
      },
    },
  });

  const category = catData?.productCategory ?? null;

  if (!category) {
    // nema kategorije → nema ni sekcije
    return null;
  }

  // 2) Uzmi 4 proizvoda iz te kategorije
  const { data: prodData } = await client.query<PopularProductsData>({
    query: GET_POPULAR_PRODUCTS,
    variables: { categoryId: category.databaseId },
    context: {
      fetchOptions: {
        next: { revalidate: 300 },
        cache: "force-cache",
      },
    },
  });

  const products = prodData?.products?.nodes ?? [];

  if (!products.length) {
    return null;
  }

  return (
    <section className="w-full py-10 lg:py-16">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl secondary-color">
              Najpopularniji proizvodi
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Brzi pregled proizvoda koje kupci najčešće naručuju.
            </p>
          </div>
        </div>

        {/* Grid: 2 na mobilnom, 4 na desktopu */}
        <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              href={`/products/${product.slug}`} // promeni ako ti je drugačiji detalj proizvoda
              name={product.name}
              imageUrl={product.image?.sourceUrl ?? null}
              imageAlt={product.image?.altText ?? product.name}
              price={product.price ?? null}
              brandName={null}
              brandLabel="Brend"
            />
          ))}
        </div>

        {/* Dugme ka kategoriji */}
        <div className="mt-8 flex justify-center">
          <Link
            href={`/categories/${POPULAR_CATEGORY_SLUG}`}
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium tracking-wide shadow-sm transition hover:bg-accent hover:text-accent-foreground"
          >
            Pogledaj sve najpopularnije proizvode
          </Link>
        </div>
      </div>
    </section>
  );
}