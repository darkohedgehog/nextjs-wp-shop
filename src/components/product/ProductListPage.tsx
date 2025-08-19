import { gql } from '@apollo/client';
import { client } from '@/lib/apollo-client';
import ProductListClient from '@/components/product/ProductListClient';

interface Product {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  price?: string;
  image?: { sourceUrl: string; altText?: string };
}
interface PageInfo { endCursor: string | null; hasNextPage: boolean; }
interface ProductsData {
  products: { pageInfo: PageInfo; nodes: Product[] };
}

const GET_PRODUCTS = gql`
  query GetProducts($search: String, $category: [String], $after: String) {
    products(first: 6, after: $after, where: { search: $search, categoryIn: $category }) {
      pageInfo { endCursor hasNextPage }
      nodes {
        id name slug description
        ... on SimpleProduct { price image { sourceUrl altText } }
      }
    }
  }
`;

export default async function ProductsPage({
  searchParams,
}: { searchParams?: Record<string, string | string[] | undefined> }) {
  const search = typeof searchParams?.q === 'string' ? searchParams.q : undefined;

  const { data } = await client.query<ProductsData>({
    query: GET_PRODUCTS,
    variables: { search, category: undefined, after: null },
  });

  const initialProducts = data?.products?.nodes ?? [];
  const initialPageInfo = data?.products?.pageInfo ?? { endCursor: null, hasNextPage: false };

  // ⛔️ NE prosleđuj DocumentNode!
  return (
    <ProductListClient
      initialProducts={initialProducts}
      initialPageInfo={initialPageInfo}
      initialSearch={search ?? ''}
    />
  );
}