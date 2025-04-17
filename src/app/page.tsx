import React from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Link from "next/link";

const HomePage: React.FC = () => {
  return (
    <>
    <Header/>
    
    
    <div className="relative min-h-screen  flex flex-col items-center justify-center text-center px-4">
      {/* Static background pattern using Tailwind and ShadCN-friendly styles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#ff6b6b]/20 via-[#feca57]/20 to-[#ff9ff3]/20 blur-2xl z-0 animate-pulse" />

      <div className="relative z-10 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          The Best Restaurant Menu App
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Discover TapToDine – Your digital menu solution to explore, order, and enjoy food with ease.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
         <Link href="restaurant">
          <Button size="lg" className="text-lg px-8 py-6  hover:bg-amber-600 ">
            Get OnBoard
          </Button></Link>
          <Link href="restaurant">
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-amber-400  hover:bg-amber-100/10">
            Download App
          </Button>
          </Link>
        </div>

       
      </div>
    </div>
    </>
  );
};

export default HomePage;
