"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ProductForm } from "./product-form";
import { PlusCircle } from "lucide-react";

export function AppHeader() {
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline-block">Product Price Lookup</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Button onClick={() => setCreateFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </header>
      <ProductForm open={isCreateFormOpen} onOpenChange={setCreateFormOpen} />
    </>
  );
}
