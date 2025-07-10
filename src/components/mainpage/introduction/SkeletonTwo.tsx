"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const images = [
  "https://images.unsplash.com/photo-1517322048670-4fba75cbbb62?q=80&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=3425&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555400038-63f5ba517a47?q=80&w=3540&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1554931670-4ebfabf6e7a9?q=80&w=3387&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546484475-7f7bd55792da?q=80&w=2581&auto=format&fit=crop",
];

export const SkeletonTwo = () => {
  const [rotations, setRotations] = useState<number[]>([]);

  useEffect(() => {
    const generated = images.map(() => Math.random() * 20 - 10);
    setRotations(generated);
  }, []);

  const imageVariants = {
    whileHover: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
    whileTap: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
  };

  return (
    <div className="relative flex flex-col items-start p-8 gap-10 h-full overflow-hidden">
      <div className="flex flex-row -ml-20">
        {images.map((image, idx) => (
          <motion.div
            key={"images-first" + idx}
            variants={imageVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            style={{ rotate: rotations[idx] || 0 }}
            className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 shrink-0 overflow-hidden"
          >
            <Image
              src={image}
              alt="bali images"
              width={500}
              height={500}
              priority
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};