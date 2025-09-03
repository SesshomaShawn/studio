import { AppHeader } from "@/components/app-header";
import { ProductFilters } from "@/components/product-filters";
import { ProductSearch } from "@/components/product-search";
import { ProductCard } from "@/components/product-card";
import { getAllCategories, getProducts } from "@/lib/actions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/pagination-controls";
import { Product } from "@/lib/types";

type HomeProps = {
  searchParams?: {
    query?: string;
    category?: string;
    page?: string;
    limit?: string;
  };
};

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-48 w-full md:w-48 rounded-lg" />
          <div className="space-y-4 flex-grow">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function ProductGrid({ query, category, page, limit }: { query?: string; category?: string; page?: number, limit?: number }) {
  const { products, totalCount } = await getProducts({ query, category, page, limit });

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center col-span-full max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold tracking-tight">Không tìm thấy mặt hàng nào</h3>
        <p className="text-sm text-muted-foreground">
          Hãy thử điều chỉnh lại tìm kiếm hoặc bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
       <PaginationControls
          itemCount={totalCount}
          currentPage={page || 1}
          itemsPerPage={limit || 8}
        />
    </>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const query = searchParams?.query;
  const category = searchParams?.category;
  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 8;
  const categories = await getAllCategories();

  const suspenseKey = `${query}-${category}-${page}-${limit}`;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8 container mx-auto">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Quản Lý Hàng Hóa
          </h1>
          <p className="text-lg text-muted-foreground">
            Tìm kiếm, lọc và quản lý các mặt hàng của bạn một cách dễ dàng.
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
          <ProductSearch placeholder="Tìm kiếm theo tên mặt hàng..." />
          <div className="flex w-full gap-4 md:w-auto">
             <ProductFilters categories={categories} />
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <Suspense key={suspenseKey} fallback={<ProductGridSkeleton />}>
            <ProductGrid query={query} category={category} page={page} limit={limit} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
