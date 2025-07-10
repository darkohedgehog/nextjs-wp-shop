"use client";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import React, { useState } from "react";
import Logo from "@/components/logo/Logo";
import MobileChildNavItems from "./MobileChildNavItems";

const MobileNav = ({ navItems }: any) => {
    const [open, setOpen] = useState(false);
  
    return (
      <>
        <motion.div
          animate={{ borderRadius: open ? "4px" : "2rem" }}
          key={String(open)}
          className="relative mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-gradient-custom px-4 py-2 lg:hidden"
        >
          <div className="flex w-full flex-row items-center justify-between">
            <Logo />
            {open ? (
              <IconX
                className="text-black dark:text-white"
                onClick={() => setOpen(!open)}
              />
            ) : (
              <IconMenu2
                className="text-black dark:text-white"
                onClick={() => setOpen(!open)}
              />
            )}
          </div>
  
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 top-16 z-20 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-primary-color px-4 py-8"
              >
                {navItems.map((navItem: any, idx: number) => (
                  <div key={`navItem-${idx}`} className="w-full">
                    {navItem.children ? (
                      <MobileChildNavItems navItem={navItem} />
                    ) : (
                      <Link
                        href={navItem.link}
                        className="relative text-neutral-600 dark:text-neutral-300"
                      >
                        <motion.span className="block">
                          {navItem.name}
                        </motion.span>
                      </Link>
                    )}
                  </div>
                ))}
                <button className="w-full rounded-lg bg-black px-8 py-2 font-medium text-white shadow-[0px_-2px_0px_0px_rgba(255,255,255,0.4)_inset] dark:bg-white dark:text-black">
                  Košarica
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </>
    );
  };

  export default MobileNav;