import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import firebaseConfig from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "https://taptodine-api.onrender.com";

interface Item {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  items: Item[];
  fulfilled: boolean;
  createdAt: { _seconds: number; _nanoseconds: number };
  total?: number;
  tableNumber?: number;
}

function calculateRevenue(orders: Order[]): number {
  if (!orders || orders.length === 0) return 0;
  return orders.reduce((acc, order) => {
    const orderTotal = order.items?.reduce((sum, item) => sum + item.price * item.qty, 0) || 0;
    return acc + orderTotal;
  }, 0);
}

const OrdersTab = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [now, setNow] = React.useState<Date>(new Date());
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const previousOrdersRef = React.useRef<Order[]>([]); // To track previous orders

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const audio = new Audio("/sounds/notification.mp3");
    audioRef.current = audio;
  }, []);

  React.useEffect(() => {
    if (!restaurantId) return;

    const ordersRef = ref(db, `liveOrders/${restaurantId}`);
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (Array.isArray(data)) {
        const updatedOrders = data.map((order: Order) => ({
          ...order,
          total: calculateRevenue([order])
        }));

        const newOrderAdded = updatedOrders.length > orders.length ||
          updatedOrders.some((o) => !orders.find((prev) => prev.id === o.id));

        if (newOrderAdded) {
          // Play sound if there is a new order and tab is hidden
          if (audioRef.current) {
            if (document.hidden) {
              audioRef.current.play().catch((err) => {
                console.warn("Unable to play sound:", err);
              });
            }
          }
        }

        // Update state and previous orders for next comparison
        setOrders(updatedOrders);
        previousOrdersRef.current = updatedOrders;
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, [restaurantId]);

  const handleDeleteOrder = async (id: string) => {
    try {
      await axios.delete(`${API_HOST}/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      alert("Order deleted");
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const handleFulfillOrder = async (id: string) => {
    try {
      await axios.put(`${API_HOST}/orders/fulfilled/${restaurantId}/${id}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, fulfilled: true } : o))
      );
      alert("Order marked as fulfilled");
    } catch (error) {
      console.error("Error marking order as fulfilled:", error);
    }
  };

  const formatRemainingTime = (createdAtObject: { _seconds: number; _nanoseconds: number }) => {
    const orderTime = new Date(createdAtObject._seconds * 1000 + createdAtObject._nanoseconds / 1000000);
    const deadline = new Date(orderTime.getTime() + 15 * 60 * 1000);
    const diff = deadline.getTime() - now.getTime();

    const absDiff = Math.abs(diff);
    const totalSeconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");

    return {
      text: `${diff < 0 ? "-" : ""}${minutes}:${seconds}`,
      overdue: diff < 0
    };
  };

  const totalRevenue = calculateRevenue(orders);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Orders</h2>
      <div className="grid gap-4">
        {orders.map((order) => {
          const { text, overdue } = formatRemainingTime(order.createdAt);

          return (
            <Card key={order.id}>
              <CardContent className="p-4 space-y-2">
                <h1><strong>Table Number:</strong> {order.tableNumber}</h1>
                <div>
                  <strong>Items:</strong>
                  <ul className="list-disc ml-4 space-y-2">
                    {order.items?.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                        {item.name} - ₹{item.price} <b>x {item.qty}</b>
                      </li>
                    ))}
                  </ul>
                </div>
                <p><strong>Total:</strong> ₹{order.total}</p>
                <p><strong>Status:</strong> {order.fulfilled ? "Fulfilled" : "Pending"}</p>
                <p className={`text-sm font-semibold ${overdue ? 'text-red-600' : 'text-green-600'}`}>
                  {overdue ? `⏰ Overdue by: ${text}` : `🕒 Time Remaining: ${text}`}
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => handleDeleteOrder(order.id)} variant="destructive">Delete</Button>
                  {!order.fulfilled && (
                    <Button onClick={() => handleFulfillOrder(order.id)}>Mark Fulfilled</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="text-lg font-semibold text-right mt-4">
        Total Revenue: ₹{totalRevenue}
      </div>
    </div>
  );
};

export default OrdersTab;
