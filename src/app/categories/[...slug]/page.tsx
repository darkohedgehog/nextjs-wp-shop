'use client';

import { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { client } from '@/lib/apollo-client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import he from 'he';

// --- Tipovi podataka
type Category = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image?: { sourceUrl: string; altText?: string };
  children: { nodes: Category[] };
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price?: string;
  image?: { sourceUrl: string; altText?: string };
};

type PageInfo = { endCursor: string; hasNextPage: boolean };

type ProductsData = {
  products: {
    pageInfo: PageInfo;
    nodes: Product[];
  };
};

type CategoryData = {
  productCategory: Category;
};

// GraphQL queries (ostaju isti)
const GET_CATEGORY_TREE = gql`
  query CategoryTree($slug: ID!) {
    productCategory(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      image { sourceUrl altText }
      children { nodes { id databaseId name slug image { sourceUrl altText } } }
    }
  }
`;

const GET_PRODUCTS_BY_CATEGORY = gql`
  query ProductsByCategory($categoryId: Int!, $after: String) {
    products(first: 10, after: $after, where: { categoryId: $categoryId }) {
      pageInfo { endCursor hasNextPage }
      nodes { id name slug ... on SimpleProduct { price image { sourceUrl altText } } }
    }
  }
`;

export default function CategoryPage() {
  // Dynamic slugs
  const params = useParams();
  const slugs = Array.isArray(params.slug) ? params.slug : [params.slug];
  const parentSlug = slugs[0];
  const childSlug = slugs[1] || null;

  // Fetch category tree
  const { data: catData, loading: catLoading, error: catError } = useQuery<CategoryData>(
    GET_CATEGORY_TREE,
    { variables: { slug: parentSlug }, client }
  );

  // Compute current category id
  const parentCat = catData?.productCategory;
  const currentCat: Category | null = parentCat
    ? childSlug
      ? parentCat.children.nodes.find((c) => c.slug === childSlug) || null
      : parentCat
    : null;
  const categoryId = currentCat?.databaseId;

  // State for pagination
  const [products, setProducts] = useState<Product[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ endCursor: '', hasNextPage: false });

  // Fetch products for leaf category (skip until categoryId available)
  const { data: prodData, loading: prodLoading, error: prodError, fetchMore } = useQuery<ProductsData>(
    GET_PRODUCTS_BY_CATEGORY,
    {
      variables: { categoryId: categoryId as number, after: null },
      skip: !categoryId,
      client,
    }
  );

  // Update state on new data
  useEffect(() => {
    if (prodData) {
      setProducts(prodData.products.nodes);
      setPageInfo(prodData.products.pageInfo);
    }
  }, [prodData]);

  const loadMore = async () => {
    if (!fetchMore || !pageInfo.hasNextPage) return;
    const { data } = await fetchMore({ variables: { after: pageInfo.endCursor } });
    setProducts((prev) => [...prev, ...data.products.nodes]);
    setPageInfo(data.products.pageInfo);
  };

  // Rendering logic
  if (catLoading) return <p className="p-4">Učitavanje kategorije...</p>;
  if (catError || !parentCat) return <p className="p-4 text-red-600">Kategorija nije pronađena.</p>;
  if (!currentCat) return <p className="p-4 text-red-600">Podkategorija nije pronađena.</p>;

  const showSubcategories = !childSlug && parentCat.children.nodes.length > 0;
  const subCategories = parentCat.children.nodes;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{currentCat.name}</h1>

      {showSubcategories ? (
        <div className="grid grid-cols-3 gap-6">
          {subCategories.map((sub: Category) => (
            <Link 
              key={sub.slug} 
              href={`/categories/${parentSlug}/${sub.slug}`} 
              className="border rounded overflow-hidden hover:shadow-lg">
              {sub.image?.sourceUrl && (
                <Image 
                  src={sub.image.sourceUrl} 
                  alt={sub.image.altText || sub.name} 
                  width={300} 
                  height={200} 
                  className="w-full h-48 object-cover" />
              )}
              <div className="p-4 text-center">
                <h2 className="text-xl font-semibold">{sub.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {products.map((product: Product) => (
              <Link 
                key={product.id}
                href={`/products/${product.slug}`} 
                className="border p-4 rounded shadow hover:shadow-lg transition">
                {product.image?.sourceUrl && (
                  <Image 
                    src={product.image.sourceUrl} 
                    alt={product.image.altText || product.name}
                    width={200}
                    height={200} 
                    className="w-full h-40 object-cover mb-2" />
                )}
                <h2 className="text-lg font-bold mb-1">{product.name}</h2>
                {product.price && 
                  <p className="text-green-600 font-semibold">
                    {he.decode(product.price).replace(/&nbsp;|&npsb;/g, '').trim()}
                  </p>}
              </Link>
            ))}
          </div>

          {pageInfo.hasNextPage && (
            <div className="mt-4 text-center">
              <button onClick={loadMore} className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700">
                Učitaj još
              </button>
            </div>
          )}

          {prodLoading && <p className="mt-4 text-center">Učitavanje...</p>}
          {prodError && <p className="mt-4 text-red-600">Greška: {prodError.message}</p>}
        </>
      )}
    </div>
  );
}