// src/components/product/ProductListPage.tsx (ili gde ti već stoji)

import { gql } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import ProductListClient from "@/components/product/ProductListClient";

import type { Product, PageInfo } from "@/types/product";

type ProductsData = {
  products: {
    pageInfo: PageInfo;
    nodes: Array<(Product & { databaseId?: number | null }) | null>;
  };
};

const GET_PRODUCTS = gql`
  query GetProducts($search: String, $category: [String], $after: String) {
    products(
      first: 24
      after: $after
      where: { search: $search, categoryIn: $category }
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        databaseId
        id
        name
        slug
        description

        ... on Product {
          date
        }

        ... on SimpleProduct {
          price
          image {
            sourceUrl
            altText
          }
        }

        ... on SimpleProduct {
          terms(first: 10, where: { taxonomies: [PWBBRAND] }) {
            nodes {
              __typename
              ... on PwbBrand { name slug }
              ... on TermNode { name slug }
            }
          }
        }
        ... on VariableProduct {
          terms(first: 10, where: { taxonomies: [PWBBRAND] }) {
            nodes {
              __typename
              ... on PwbBrand { name slug }
              ... on TermNode { name slug }
            }
          }
        }
        ... on ExternalProduct {
          terms(first: 10, where: { taxonomies: [PWBBRAND] }) {
            nodes {
              __typename
              ... on PwbBrand { name slug }
              ... on TermNode { name slug }
            }
          }
        }
        ... on GroupProduct {
          terms(first: 10, where: { taxonomies: [PWBBRAND] }) {
            nodes {
              __typename
              ... on PwbBrand { name slug }
              ... on TermNode { name slug }
            }
          }
        }
      }
    }
  }
`;

type SearchParams = Record<string, string | string[] | undefined>;

export type ProductListPageProps = {
  searchParams?: SearchParams;
};

function getSearchTerm(sp?: SearchParams): string | undefined {
  const raw = sp?.q;
  const value =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;

  const trimmed = (value ?? "").trim();
  return trimmed.length ? trimmed : undefined;
}

export default async function ProductListPage({ searchParams }: ProductListPageProps) {
  const search = getSearchTerm(searchParams);

  const { data } = await client.query<ProductsData>({
    query: GET_PRODUCTS,
    variables: {
      search,
      category: null,
      after: null,
    },
  });

  // ✅ 1) izbaci null node-ove
  // ✅ 2) normalizuj databaseId: null -> undefined
  const initialProducts: Product[] = (data?.products?.nodes ?? [])
    .filter((p): p is NonNullable<(Product & { databaseId?: number | null })> => Boolean(p))
    .map((p) => ({
      ...p,
      databaseId: p.databaseId ?? undefined,
    }));

  const initialPageInfo: PageInfo = data?.products?.pageInfo ?? {
    endCursor: null,
    hasNextPage: false,
  };

  return (
    <ProductListClient
      initialProducts={initialProducts}
      initialPageInfo={initialPageInfo}
      initialSearch={search ?? ""}
    />
  );
}