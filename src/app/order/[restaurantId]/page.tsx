"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import OrderInProgress from "@/components/OrderInProgress";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
  DrawerHeader,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Minus, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { Label } from "@/components/ui/label";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:5000";

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface CartItem extends MenuItem {
  qty: number;
}

const OrderPage = () => {
  const params = useParams();
  const restaurantId = params?.restaurantId as string;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [tableNumber, setTableNumber] = useState<number | undefined>();

  // ✅ New state for tracking order placement
  const [orderPlacedTime, setOrderPlacedTime] = useState<Date | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!restaurantId) return;
      try {
        const res = await fetch(`${API_HOST}/menu/${restaurantId}`);
        const data = await res.json();
        setMenuItems(data);
      } catch (err: any) {
        setMessage("Error fetching menu: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();

    const fetchName = async () => {
      if (!restaurantId) return;
      try {
        const res = await fetch(`${API_HOST}/name/${restaurantId}`);
        const data = await res.json();
        setRestaurantName(data.restaurantName);
      } catch (err: any) {
        setMessage("Error fetching Name: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchName();
  }, [restaurantId]);

  const updateCart = (item: MenuItem, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) return prev.filter((i) => i.id !== item.id);
        return prev.map((i) => (i.id === item.id ? { ...i, qty: newQty } : i));
      } else {
        return [...prev, { ...item, qty: 1 }];
      }
    });
  };

  const handleQtyInput = (itemId: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, qty: qty || 1 } : i))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      setMessage("Please add at least one item to cart.");
      return;
    }
    if (!tableNumber || isNaN(tableNumber)) {
      setMessage("Please enter a valid table number.");
      return;
    }

    const items = cart.map((item) => ({
      name: item.name,
      price: item.price,
      qty: item.qty,
    }));

    const orderData = { restaurantId, items, tableNumber };

    try {
      const res = await fetch(`${API_HOST}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        setCart([]);
        setOrderPlacedTime(new Date()); // ✅ trigger success screen
      } else {
        const text = await res.text();
        setMessage("Error: " + text);
      }
    } catch (err: any) {
      setMessage("Order failed: " + err.message);
    }
  };

  // ✅ Reset state to allow placing another order
  const resetOrder = () => {
    setOrderPlacedTime(null);
    setMessage("");
    setTableNumber(undefined);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <>
      <Header />

      <div className="container mx-auto p-4 pb-28">
        <h1 className="text-2xl font-bold mb-4">
          <b>{restaurantName}</b> Menu
        </h1>

        {/* ✅ Show OrderInProgress if order is placed */}
        {orderPlacedTime ? (
          <OrderInProgress orderPlacedTime={orderPlacedTime} onReset={resetOrder} />
        ) : (
          <>
            {loading ? (
              <p>Loading menu...</p>
            ) : (
              <div className="space-y-4">
                {menuItems.map((item) => {
                  const cartItem = cart.find((c) => c.id === item.id);
                  const qty = cartItem?.qty || 0;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border p-3 rounded-xl shadow-sm"
                    >
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-500">₹{item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateCart(item, -1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-6 text-center">{qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateCart(item, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Drawer>
              <DrawerTrigger asChild>
                <Button className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 sm:w-1/2 rounded-2xl shadow-xl text-lg py-6 z-50">
                  View Cart (₹{total.toFixed(2)})
                </Button>
              </DrawerTrigger>

              <DrawerContent className="flex flex-col h-[calc(100vh-80px)]">
                <DrawerHeader>
                  <DrawerTitle>Your Cart</DrawerTitle>
                </DrawerHeader>

                {cart.length === 0 ? (
                  <p className="text-center mt-4 text-muted-foreground">
                    No items in cart.
                  </p>
                ) : (
                  <>
                    <ScrollArea className="flex-1 px-6 overflow-auto">
                      <div className="space-y-4 pb-4">
                        {cart.map((item, index) => (
                          <div key={item.id}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  ₹{item.price} x {item.qty} = ₹
                                  {item.price * item.qty}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateCart(item, -1)}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <input
                                  type="number"
                                  min={1}
                                  value={item.qty}
                                  onChange={(e) =>
                                    handleQtyInput(
                                      item.id,
                                      parseInt(e.target.value, 10)
                                    )
                                  }
                                  className="w-12 border rounded-md text-center text-sm"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateCart(item, 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            {index !== cart.length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="px-6 mt-4">
                      <Label htmlFor="table-number">Table Number</Label>
                      <input
                        id="table-number"
                        type="number"
                        min={1}
                        value={tableNumber ?? ""}
                        onChange={(e) =>
                          setTableNumber(parseInt(e.target.value, 10))
                        }
                        className="mt-1 w-full border px-3 py-2 rounded-md text-sm"
                        placeholder="Enter your table number"
                      />
                    </div>
                    <div className="px-6 pt-4 border-t mt-4">
                      <p className="text-lg font-semibold">
                        Total: ₹{total.toFixed(2)}
                      </p>
                      <DrawerFooter className="p-0 pt-4">
                        <Button className="w-full" onClick={placeOrder}>
                          Place Order
                        </Button>
                        {message && (
                          <p className="mt-2 text-center text-sm text-muted-foreground">
                            {message}
                          </p>
                        )}
                      </DrawerFooter>
                    </div>
                  </>
                )}
              </DrawerContent>
            </Drawer>
          </>
        )}
      </div>
    </>
  );
};

export default OrderPage;
