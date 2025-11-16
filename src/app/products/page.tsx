import ProductMenuSSR from '@/components/navigation/ProductMenuSSR';
import ProductListPage from '@/components/product/ProductListPage';

export default function ProductsPage() {
  return (
    // Visina ekrana (ako imaš veliki header, možeš prilagoditi calc)
    <div className="h-screen">
      <div className="container mx-auto px-4 py-6 h-full">
        {/* Flex layout za sidebar + content */}
        <div className="flex gap-8 h-full overflow-hidden">
          
          {/* LEVI STUPAC: sidebar sa sopstvenim scrollom */}
          <div className="hidden lg:block w-72 shrink-0 h-full overflow-y-auto">
            <ProductMenuSSR />
          </div>

          {/* DESNI STUPAC: proizvodi sa sopstvenim scrollom */}
          <div className="flex-1 min-w-0 h-full overflow-y-auto">
            <ProductListPage />
          </div>
        </div>
      </div>
    </div>
  );
}