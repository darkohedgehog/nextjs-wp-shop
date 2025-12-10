"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { TiShoppingCart } from "react-icons/ti";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export default function CartButton() {
  const items = useCart((s) => s.items);

  // Ukupan broj stavki
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

  // Kontrola animacije
  const controls = useAnimation();

  useEffect(() => {
    // pokreni malu bounce animaciju
    controls.start({
      scale: [1, 1.25, 0.9, 1],
      transition: { duration: 0.35, ease: "easeOut" },
    });
  }, [totalQty, controls]);

  return (
    <Link href="/cart">
      <button
        className="
          relative flex items-center justify-center
          rounded-full bg-white px-4 py-2 text-sm font-bold text-black
          shadow-[0px_-2px_0px_0px_rgba(255,255,255,0.4)_inset]
          border border-zinc-300
          hover:bg-zinc-100 transition
        "
      >
        <TiShoppingCart className="text-xl" />

        {/* Badge sa animacijom */}
        <motion.span
          animate={controls}
          className="
            absolute -top-1 -right-1
            rounded-full bg-cyan-500 text-white 
            text-xs font-bold px-2 py-px
            shadow-md
          "
        >
          {totalQty}
        </motion.span>
      </button>
    </Link>
  );
}