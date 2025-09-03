"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/context/cart-context";
import { ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
}

export function CartDrawer() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const [cashGiven, setCashGiven] = useState(0);

  const cartTotal = getCartTotal();
  const change = cashGiven > 0 ? cashGiven - cartTotal : 0;

  const handleClearCart = () => {
    clearCart();
    setCashGiven(0);
  }

  const handleCheckout = () => {
    toast({
        title: "Thanh toán thành công!",
        description: `Đơn hàng của bạn gồm ${cartItems.length} mặt hàng với tổng giá trị ${formatPrice(cartTotal)} đã được đặt.`,
    })
    clearCart();
    setCashGiven(0);
  }
  
  const handleQuantityChange = (itemId: string, value: string) => {
    const newQuantity = parseFloat(value);
     if (value === "") {
        // Allow user to clear input without removing item
        return;
    }
    if (!isNaN(newQuantity)) {
        updateQuantity(itemId, newQuantity);
    }
  }


  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {cartItems.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </Badge>
          )}
          <span className="sr-only">Mở giỏ hàng</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Giỏ hàng của bạn ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</SheetTitle>
        </SheetHeader>
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-grow pr-4 -mr-6">
              <div className="flex flex-col gap-4 py-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                       <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                       />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                       <div className="flex items-center gap-2 mt-2">
                         <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max={item.stock}
                            defaultValue={item.quantity}
                            onBlur={(e) => {
                                const val = e.target.value;
                                if(val === "") {
                                    // If user clears the input and blurs, remove the item
                                    updateQuantity(item.id, 0);
                                } else {
                                    handleQuantityChange(item.id, val)
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleQuantityChange(item.id, e.currentTarget.value)
                                    e.currentTarget.blur();
                                }
                            }}
                            className="h-8 w-20"
                         />
                         <span className="text-sm text-muted-foreground">{item.unit}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
             <div className="mt-auto flex-col space-y-4 border-t pt-4">
                <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(cartTotal)}</span>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cash-given">Tiền khách đưa (VND)</Label>
                    <Input 
                        id="cash-given"
                        type="number"
                        placeholder="Nhập số tiền khách đưa..."
                        value={cashGiven || ""}
                        onChange={(e) => setCashGiven(Number(e.target.value))}
                    />
                </div>
                
                {cashGiven > 0 && (
                    <div className={cn(
                        "flex justify-between items-center font-semibold text-lg",
                        change < 0 ? "text-destructive" : "text-primary"
                    )}>
                        <span>{change < 0 ? "Còn thiếu" : "Tiền thừa"}</span>
                        <span>{formatPrice(Math.abs(change))}</span>
                    </div>
                )}


                 <SheetFooter className="grid grid-cols-2 gap-2 w-full pt-4">
                    <Button variant="outline" onClick={handleClearCart}>Dọn giỏ hàng</Button>
                    <SheetClose asChild>
                        <Button onClick={handleCheckout} disabled={change < 0}>Thanh toán</Button>
                    </SheetClose>
                </SheetFooter>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">Giỏ hàng của bạn đang trống</p>
            <p className="text-muted-foreground">Hãy thêm vài mặt hàng để bắt đầu nhé!</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
