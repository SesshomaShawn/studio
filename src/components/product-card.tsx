
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
import { vi } from "date-fns/locale";
import { ProductForm } from "./product-form";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { Calendar, DollarSign, Package, Pencil, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const isExpired = new Date(product.expiryDate) < new Date();
  const isLowStock = product.stock < 20;

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Đã thêm vào giỏ",
    });
  };

  return (
    <>
      <Card className="w-full overflow-hidden transition-all hover:shadow-lg flex flex-col">
        <div className="relative w-full aspect-[4/3]">
            <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                data-ai-hint={`${product.category} product`}
            />
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <CardHeader className="p-0">
                <Badge variant="outline" className="mb-2 w-fit">{product.category}</Badge>
                <CardTitle className="text-lg font-semibold leading-tight">{product.name}</CardTitle>
                <CardDescription className="mt-1 text-sm line-clamp-2">{product.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="p-0 pt-4 flex-grow">
                <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                    </span>
                    <span>/ {product.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span>Còn {product.stock}</span>
                    {product.stock === 0 ? (
                    <Badge variant="destructive" className="ml-auto">Hết</Badge>
                    ) : isLowStock ? (
                    <Badge variant="destructive" className="ml-auto">Sắp hết</Badge>
                    ) : null}
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>HSD: {format(new Date(product.expiryDate), "dd/MM/yyyy", { locale: vi })}</span>
                    {isExpired && <Badge variant="destructive" className="ml-auto">Hết hạn</Badge>}
                </div>
                </div>
            </CardContent>
        </div>
        <CardFooter className="p-4 pt-4 mt-auto flex flex-col sm:flex-row items-center gap-2">
            <Button className="w-full sm:w-auto sm:flex-grow" size="sm" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Thêm vào giỏ
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="icon" className="w-full sm:w-9" onClick={() => setEditFormOpen(true)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Sửa</span>
              </Button>
              <Button variant="destructive" size="icon" className="w-full sm:w-9" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4" />
                 <span className="sr-only">Xóa</span>
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
