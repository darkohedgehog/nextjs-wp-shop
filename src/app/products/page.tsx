import ClientApolloProvider from '@/components/ClientApolloProvider';
import ProductListPage from '@/components/product/ProductListPage';

export default function ProductsPage() {
  return (
    <ClientApolloProvider>
      <ProductListPage />
    </ClientApolloProvider>
  );
}