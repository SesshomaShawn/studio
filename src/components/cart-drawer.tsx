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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/context/cart-context";
import { ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
}

export function CartDrawer() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { toast } = useToast();

  const handleCheckout = () => {
    toast({
        title: "Checkout Successful!",
        description: `Your order of ${cartItems.length} item(s) for a total of ${formatPrice(getCartTotal())} has been placed.`,
    })
    clearCart();
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
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</SheetTitle>
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
                            min="1"
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                            className="h-8 w-16"
                         />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto flex-col space-y-4">
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(getCartTotal())}</span>
                </div>
                 <div className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={clearCart}>Clear Cart</Button>
                    <SheetClose asChild>
                        <Button className="w-full" onClick={handleCheckout}>Checkout</Button>
                    </SheetClose>
                </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">Your cart is empty</p>
            <p className="text-muted-foreground">Add some products to get started!</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
