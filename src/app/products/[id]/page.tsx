import { useCartStore } from "../../../../zustand/useCartStore";


async function fetchProduct(id: string) {
  const res = await fetch(`http://zivic-elektro.local/wp-json/wc/v3/products/${id}`);
  return res.json();
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);

  return (
    <div className="p-4">
      <img src={product.images[0]?.src} alt={product.name} className="w-full h-60 object-cover" />
      <h1 className="text-2xl font-bold mt-4">{product.name}</h1>
      <p>{product.price} €</p>
      <p className="mt-2 text-sm">{product.description}</p>
      <button
        onClick={() => useCartStore.getState().addToCart({ id: product.id, name: product.name, price: parseFloat(product.price), quantity: 1 })}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Dodaj u korpu
      </button>
    </div>
  );
}