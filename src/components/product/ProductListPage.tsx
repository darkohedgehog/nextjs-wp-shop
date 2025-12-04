// src/components/product/ProductListPage.tsx

import { gql } from '@apollo/client';
import { client } from '@/lib/apollo-client';
import ProductListClient from '@/components/product/ProductListClient';

// isti Brand / Product tip kao u ProductListClient
type Brand = { name?: string | null; slug?: string | null };

interface Product {
  databaseId?: number;
  id: string | number;
  name: string;
  slug: string;
  description?: string | null;
  date?: string | null;
  price?: string | null;
  image?: { sourceUrl: string; altText?: string | null } | null;
  terms?: { nodes?: Brand[] } | null;
}

interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

interface ProductsData {
  products: { pageInfo: PageInfo; nodes: Product[] };
}

const GET_PRODUCTS = gql`
  query GetProducts($search: String, $category: [String], $after: String) {
    products(
      first: 6
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

        # datum preko interfejsa Product
        ... on Product {
          date
        }

        # price / image na SimpleProduct
        ... on SimpleProduct {
          price
          image {
            sourceUrl
            altText
          }
        }

        # PWB brend termini — za sve tipove
        ... on SimpleProduct {
          terms(first: 10, where: { taxonomies: [PWBBRAND] }) {
            nodes {
              __typename
              ... on PwbBrand {
                name
                slug
              }
              ... on TermNode {
                name
                slug
              }
            }
          }
        }
        ... on VariableProduct {
          terms(first: 10, where: { taxonomies: [PWBBRAND] }) {
            nodes {
              __typename
              ... on PwbBrand {
                name
                slug
              }
              ... on TermNode {
                name
                slug
              }
            }
          }
        }
        ... on ExternalProduct {
          terms(first: 10, where: { taxonomies: [PWBBRAND] }) {
            nodes {
              __typename
              ... on PwbBrand {
                name
                slug
              }
              ... on TermNode {
                name
                slug
              }
            }
          }
        }
        ... on GroupProduct {
          terms(first: 10, where: { taxonomies: [PWBBRAND] }) {
            nodes {
              __typename
              ... on PwbBrand {
                name
                slug
              }
              ... on TermNode {
                name
                slug
              }
            }
          }
        }
      }
    }
  }
`;

export type ProductListPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function ProductListPage({ searchParams }: ProductListPageProps) {
  const search =
    typeof searchParams?.q === 'string' ? searchParams.q : undefined;

  const { data } = await client.query<ProductsData>({
    query: GET_PRODUCTS,
    variables: { search, category: undefined, after: null },
  });

  const initialProducts = data?.products?.nodes ?? [];
  const initialPageInfo =
    data?.products?.pageInfo ?? { endCursor: null, hasNextPage: false };

  return (
    <ProductListClient
      initialProducts={initialProducts}
      initialPageInfo={initialPageInfo}
      initialSearch={search ?? ''}
    />
  );
}