
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Product } from '@/lib/types';
import { getProducts } from '@/lib/actions';
import { ProductCard } from './product-card';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const ITEMS_PER_PAGE = 8;

type ProductListProps = {
  query?: string;
  category?: string;
};

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
         <div key={i} className="flex flex-col gap-4">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}


export function ProductList({ query, category }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMoreProducts = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    
    const nextPage = page + 1;
    const { products: newProducts, totalCount } = await getProducts({ 
        query, 
        category, 
        page: nextPage, 
        limit: ITEMS_PER_PAGE 
    });

    setProducts((prev) => [...prev, ...newProducts]);
    setPage(nextPage);
    setHasMore(products.length + newProducts.length < totalCount);
    setIsLoading(false);
  }, [isLoading, hasMore, page, query, category, products.length]);

  // Initial data fetch
   useEffect(() => {
    const fetchInitialData = async () => {
        setIsLoading(true);
        const { products: initialProducts, totalCount } = await getProducts({ 
            query, 
            category, 
            page: 1, 
            limit: ITEMS_PER_PAGE 
        });
        setProducts(initialProducts);
        setPage(1);
        setHasMore(initialProducts.length < totalCount);
        setIsLoading(false);
    };

    fetchInitialData();
  // We want this to re-run ONLY when filters change, not on every re-render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProducts();
        }
      },
      { rootMargin: '200px' } // Load more when 200px away from the loader
    );

    const loader = loaderRef.current;
    if (loader) {
      observer.observe(loader);
    }

    return () => {
      if (loader) {
        observer.unobserve(loader);
      }
    };
  }, [loadMoreProducts]);


  if (products.length === 0 && !isLoading && !hasMore) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center col-span-full">
        <h3 className="text-2xl font-bold tracking-tight">Không tìm thấy mặt hàng nào</h3>
        <p className="text-sm text-muted-foreground">
          Hãy thử điều chỉnh lại tìm kiếm hoặc bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product: Product) => (
          <ProductCard key={`${product.id}-${Math.random()}`} product={product} />
        ))}
      </div>

      <div ref={loaderRef} className="col-span-full flex justify-center items-center py-6">
         {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
         {!isLoading && !hasMore && products.length > 0 && (
          <p className="text-muted-foreground">Đã hiển thị tất cả sản phẩm.</p>
        )}
      </div>
    </>
  );
}
