"use client";

import { motion } from "motion/react";
import Image from "next/image";

const images = [
  "/assets/16.61.001.png",
  "/assets/17.01.051.png",
  "/assets/razdjelnik.png",
  "/assets/camera.png",
  "/assets/12.23.001.png",
  "/assets/05.61.81.png",
];

// Deterministička pseudo-random funkcija zasnovana na indexu
function rotationForIndex(index: number): number {
  // malo "šuma" preko sinusa da izgleda random
  const x = Math.sin(index * 9753.123) * 10000;
  const fraction = x - Math.floor(x); // 0–1
  // mapiramo u opseg -10 do +10 stepeni
  return fraction * 20 - 10;
}

export const SkeletonTwo = () => {
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
      <div className="grid grid-cols-2 gap-5 mx-auto">
        {images.map((image, idx) => (
          <motion.div
            key={`images-first-${idx}`}
            variants={imageVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            style={{ rotate: rotationForIndex(idx) }}
            className="rounded-xl -mr-4 mt-4 p-1 bg-secondary-color border-[#A07CFE] border shrink-0 overflow-hidden"
          >
            <Image
              src={image}
              alt="proizvodi"
              width={200}
              height={200}
              priority
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};