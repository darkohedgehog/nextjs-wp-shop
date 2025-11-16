import ProductMenuSSR from '@/components/navigation/ProductMenuSSR';
import ProductListPage from '@/components/product/ProductListPage';

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-8">
        {/* LEVA STRANA — sidebar (samo na velikim ekranima) */}
        <ProductMenuSSR  />

        {/* DESNA STRANA — lista proizvoda */}
        <div className="flex-1 min-w-0">
          <ProductListPage />
        </div>
      </div>
    </div>
  );
}