
import ProductMenuSSR from '@/components/navigation/ProductMenuSSR';
import ProductListPage from '@/components/product/ProductListPage';

export default function ProductsPage() {
  return (
    <div>
      <div className='container mx-auto px-4 py-6 flex gap-8'>
       <ProductMenuSSR />
      </div>
      <ProductListPage />
    </div> 
  );
}