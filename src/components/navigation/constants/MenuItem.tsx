"use client";
import { motion } from "motion/react";
import React from "react";
import transition from "./tranisition";

export const MenuItem = ({
    setActive,
    active,
    item,
    children,
  }: {
    setActive: (item: string) => void;
    active: string | null;
    item: string;
    children?: React.ReactNode;
  }) => {
    return (
      <div onMouseEnter={() => setActive(item)} className="relative">
        <motion.p
          transition={{ duration: 0.3 }}
          className="cursor-pointer hover:opacity-[0.9] dark:text-neutral-100"
        >
          {item}
        </motion.p>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={transition}
          >
            {active === item && (
              <div className="absolute left-1/2 top-[calc(100%_+_0.2rem)] -translate-x-1/2 transform pt-4">
                <div className="">
                  <motion.div
                    transition={transition}
                    layoutId="active" // layoutId ensures smooth animation
                    className="mt-4 overflow-hidden rounded-2xl bg-secondary-color shadow-xl backdrop-blur-sm"
                  >
                    <motion.div
                      layout // layout ensures smooth animation
                      className="h-full w-max p-4"
                    >
                      {children}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  };