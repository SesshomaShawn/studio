
import { AppHeader } from "@/components/app-header";
import { ProductFilters } from "@/components/product-filters";
import { ProductSearch } from "@/components/product-search";
import { getAllCategories } from "@/lib/actions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductList } from "@/components/product-list";

type HomeProps = {
  searchParams?: {
    query?: string;
    category?: string;
  };
};

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
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

export default async function Home({ searchParams }: HomeProps) {
  const query = searchParams?.query;
  const category = searchParams?.category;
  const categories = await getAllCategories();

  const suspenseKey = `${query}-${category}`;

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
            <ProductList query={query} category={category} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
