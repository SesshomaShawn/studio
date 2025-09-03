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
        <div className="flex flex-col md:flex-row">
            {/* Image on the left, Content on the right for Desktop */}
            {/* On mobile, this becomes a flex-row container for image and primary details */}
            <div className="flex flex-row p-4 md:p-0">
                 <div className="relative w-24 h-24 md:w-48 md:h-auto md:flex-shrink-0">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover rounded-md"
                        sizes="(max-width: 768px) 96px, 192px"
                        data-ai-hint={`${product.category} product`}
                    />
                </div>
                 {/* Mobile: Price, Stock, HSD. Hidden on Desktop */}
                 <div className="md:hidden flex-grow pl-4">
                     <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="font-medium text-foreground text-base">
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
                            <span>HSD: {format(new Date(product.expiryDate), "dd/MM/yy", { locale: vi })}</span>
                            {isExpired && <Badge variant="destructive" className="ml-auto">Hết hạn</Badge>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content block */}
            <div className="flex flex-col flex-grow">
                 {/* Mobile: Name/Description below image. Desktop: All info on the right */}
                <CardHeader className="p-4 pt-0 md:pt-4 md:pb-2">
                    <Badge variant="outline" className="mb-2 w-fit hidden md:inline-flex">{product.category}</Badge>
                    <CardTitle className="text-lg md:text-xl font-semibold leading-tight">{product.name}</CardTitle>
                    <CardDescription className="mt-1 text-sm">{product.description}</CardDescription>
                </CardHeader>
                
                {/* Desktop: Price, Stock, HSD. Hidden on Mobile */}
                <CardContent className="hidden md:block flex-grow p-4 pt-2">
                    <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground text-base">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                        </span>
                        <span>/ {product.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span>Còn {product.stock} sản phẩm trong kho</span>
                        {product.stock === 0 ? (
                        <Badge variant="destructive">Hết hàng</Badge>
                        ) : isLowStock ? (
                        <Badge variant="destructive">Sắp hết</Badge>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>HSD: {format(new Date(product.expiryDate), "dd/MM/yyyy", { locale: vi })}</span>
                        {isExpired && <Badge variant="destructive">Hết hạn</Badge>}
                    </div>
                    </div>
                </CardContent>
            </div>
        </div>
         <CardFooter className="p-4 pt-2 mt-auto flex items-center justify-between">
             <Button className="flex-grow md:flex-grow-0" size="sm" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Thêm vào giỏ
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditFormOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Sửa
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Xóa
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
