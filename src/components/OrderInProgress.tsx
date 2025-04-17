"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  orderPlacedTime: Date;
  onReset: () => void;
}

const OrderInProgress: React.FC<Props> = ({ orderPlacedTime, onReset }) => {
  const [remainingTime, setRemainingTime] = React.useState("15:00");

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = 15 * 60 * 1000 - (now.getTime() - orderPlacedTime.getTime());
      if (diff <= 0) {
        setRemainingTime("00:00");
        clearInterval(interval);
      } else {
        const mins = String(Math.floor(diff / 60000)).padStart(2, "0");
        const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
        setRemainingTime(`${mins}:${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orderPlacedTime]);

  return (
    <Card className="p-6 text-center space-y-4">
      <h2 className="text-xl font-semibold text-green-700">
        🍽️ Your food is being prepared!
      </h2>
      <p className="text-lg text-muted-foreground">
        Estimated Time Left: <span className="font-semibold">{remainingTime}</span>
      </p>
      <Image
        src="/food_making_gif.gif"
        alt="Food Preparation"
        width={200}
        height={200}
        className="mx-auto rounded"
      />
      <Button variant="secondary" onClick={onReset}>
        Order More
      </Button>
    </Card>
  );
};

export default OrderInProgress;
