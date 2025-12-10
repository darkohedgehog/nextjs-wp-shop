import Link from "next/link";
import { client } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { ProductCard } from "@/components/product/ProductCard";
import { GiBinoculars } from "react-icons/gi";
import { RiUserStarLine } from "react-icons/ri";

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

// 2) Query za proizvode iz konkretne kategorije
const GET_POPULAR_PRODUCTS = gql`
  query PopularProductsByCategory($categoryId: Int!) {
    products(
      first: 3
      where: {
        categoryId: $categoryId
        orderby: { field: DATE, order: ASC }
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

type Product = {
  id: string;
  name: string;
  slug: string;
  price?: string | null;
  image?: {
    sourceUrl: string;
    altText?: string | null;
  } | null;
};

type PopularProductsData = {
  products?: {
    nodes: Product[];
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

  // 2) Uzmi proizvode iz te kategorije
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
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-center">
          <div>
            <h2 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium secondary-color">
              Najpopularniji proizvodi
            </h2>
            <div className="flex items-center justify-center text-lg lg:text-xl max-w-2xl my-4 mx-auto text-center font-normal paragraph-color gap-2">
              <span className="flex items-center justify-center gap-2">
                <RiUserStarLine />
                Naši kupci najčešće naručuju
              </span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              href={`/products/${product.slug}`}
              name={product.name}
              imageUrl={product.image?.sourceUrl ?? null}
              imageAlt={product.image?.altText ?? product.name}
              price={product.price ?? undefined}
              brandName={null}
              brandLabel="Brend"
            />
          ))}
        </div>

        {/* Dugme ka kategoriji */}
        <div className="mt-8 flex justify-center items-center">
          <Link
            href={`/categories/${POPULAR_CATEGORY_SLUG}`}
            className="mt-8 bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer flex items-center px-4 py-2 rounded-3xl transition border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] gap-2 text-[#007bff]"
          >
            Pogledaj sve
            <span className="uppercase text-sm font-bold flex items-center justify-center gap-2">
              <GiBinoculars className="w-5 h-5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}