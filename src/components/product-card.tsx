
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
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
      <Card className="w-full overflow-hidden transition-all hover:shadow-lg">
        {/* Mobile Layout */}
        <div className="md:hidden">
            <div className="flex p-4 gap-4">
                <div className="relative w-1/3 flex-shrink-0 aspect-square">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain rounded-md"
                        sizes="33vw"
                        data-ai-hint={`${product.category} product`}
                    />
                </div>
                <div className="w-2/3 flex flex-col justify-center">
                   <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="font-medium text-foreground">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                            </span>
                             <span className="text-xs">/ {product.unit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="text-sm">Còn {product.stock}</span>
                             {product.stock === 0 ? (
                                <Badge variant="destructive" className="ml-auto">Hết</Badge>
                            ) : isLowStock ? (
                                <Badge variant="destructive" className="ml-auto">Sắp hết</Badge>
                            ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-sm">HSD: {format(new Date(product.expiryDate), "dd/MM/yyyy", { locale: vi })}</span>
                             {isExpired && <Badge variant="destructive" className="ml-auto">Hết hạn</Badge>}
                        </div>
                    </div>
                </div>
            </div>
             <div className="px-4 pb-4">
                 <CardHeader className="p-0">
                    <Badge variant="outline" className="mb-2 w-fit">{product.category}</Badge>
                    <CardTitle className="text-base font-semibold leading-tight line-clamp-2">{product.name}</CardTitle>
                </CardHeader>
                <CardFooter className="p-0 pt-4 flex flex-col sm:flex-row items-center gap-2">
                    <Button className="w-full sm:w-auto sm:flex-grow" size="sm" onClick={handleAddToCart} disabled={product.stock === 0}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Thêm vào giỏ
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="icon" className="w-full sm:w-9 h-9" onClick={() => setEditFormOpen(true)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Sửa</span>
                        </Button>
                        <Button variant="destructive" size="icon" className="w-full sm:w-9 h-9" onClick={() => setDeleteDialogOpen(true)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Xóa</span>
                        </Button>
                    </div>
                </CardFooter>
            </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col h-full">
            <div className="relative w-full aspect-[4/3]">
            <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                data-ai-hint={`${product.category} product`}
            />
            </div>

            <div className="p-4 flex flex-col flex-grow">
            <CardHeader className="p-0">
                <Badge variant="outline" className="mb-2 w-fit">{product.category}</Badge>
                <CardTitle className="text-base font-semibold leading-tight line-clamp-2">{product.name}</CardTitle>
            </CardHeader>
            
            <CardContent className="p-0 pt-3 flex-grow">
                <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                    </span>
                    <span className="text-xs">/ {product.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm">Còn {product.stock}</span>
                    {product.stock === 0 ? (
                    <Badge variant="destructive" className="ml-auto">Hết</Badge>
                    ) : isLowStock ? (
                    <Badge variant="destructive" className="ml-auto">Sắp hết</Badge>
                    ) : null}
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">HSD: {format(new Date(product.expiryDate), "dd/MM/yyyy", { locale: vi })}</span>
                    {isExpired && <Badge variant="destructive" className="ml-auto">Hết hạn</Badge>}
                </div>
                </div>
            </CardContent>
            
            <CardFooter className="p-0 pt-4 flex flex-col sm:flex-row items-center gap-2 mt-auto">
                <Button className="w-full sm:w-auto sm:flex-grow" size="sm" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Thêm vào giỏ
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="icon" className="w-full sm:w-9 h-9" onClick={() => setEditFormOpen(true)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Sửa</span>
                </Button>
                <Button variant="destructive" size="icon" className="w-full sm:w-9 h-9" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Xóa</span>
                </Button>
                </div>
            </CardFooter>
            </div>
        </div>
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
