"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { format } from "date-fns";
import { ProductForm } from "./product-form";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { Calendar, DollarSign, Package, Pencil, Trash2 } from "lucide-react";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isExpired = new Date(product.expiryDate) < new Date();
  const isLowStock = product.stock < 20;

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="relative w-full h-48">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={`${product.category} product`}
            />
          </div>
          <div className="p-6 pb-2">
            <Badge variant="outline" className="mb-2">{product.category}</Badge>
            <CardTitle className="text-xl font-semibold leading-tight">{product.name}</CardTitle>
            <CardDescription className="mt-2 text-sm">{product.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-6 pt-2">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground text-base">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price)}
              </span>
              <span>/ {product.unit}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span>{product.stock} items in stock</span>
              {isLowStock && <Badge variant="destructive">Low Stock</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Expires on {format(new Date(product.expiryDate), "MMM d, yyyy")}</span>
               {isExpired && <Badge variant="destructive">Expired</Badge>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 mt-auto">
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditFormOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ProductForm
        product={product}
        open={isEditFormOpen}
        onOpenChange={setEditFormOpen}
      />
      <DeleteConfirmationDialog
        productId={product.id}
        productName={product.name}
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
