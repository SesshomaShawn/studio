import { AppHeader } from "@/components/app-header";
import { ProductFilters } from "@/components/product-filters";
import { ProductSearch } from "@/components/product-search";
import { ProductCard } from "@/components/product-card";
import { getAllCategories, getProducts } from "@/lib/actions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type HomeProps = {
  searchParams?: {
    query?: string;
    category?: string;
  };
};

function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function ProductGrid({ query, category }: { query?: string; category?: string; }) {
  const products = await getProducts({ query, category });

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center col-span-full">
        <h3 className="text-2xl font-bold tracking-tight">No products found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const query = searchParams?.query;
  const category = searchParams?.category;
  const categories = await getAllCategories();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8 container mx-auto">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Product Price Lookup
          </h1>
          <p className="text-lg text-muted-foreground">
            Search, filter, and manage your products with ease.
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
          <ProductSearch placeholder="Search by product name..." />
          <div className="flex w-full gap-4 md:w-auto">
             <ProductFilters categories={categories} />
          </div>
        </div>

        <Suspense key={query + category} fallback={<ProductGridSkeleton />}>
          <ProductGrid query={query} category={category} />
        </Suspense>
      </main>
    </div>
  );
}
