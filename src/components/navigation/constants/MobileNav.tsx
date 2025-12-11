"use client";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/logo/Logo";
import MobileChildNavItems from "./MobileChildNavItems";
import CartButton from "@/components/cart/CartButton";
import DyslexiaToggle from "@/components/hooks/DyslexiaToggle";

type NavChild = {
  name: string;
  link: string;
};

type NavProduct = {
  title: string;
  href: string;
  src: string;
  description: string;
};

type NavItem = {
  name: string;
  link: string;
  children?: NavChild[];
  products?: NavProduct[];
};

type MobileNavProps = {
  navItems: NavItem[];
};
const MobileNav = ({ navItems }: MobileNavProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        animate={{ borderRadius: open ? "4px" : "2rem" }}
        key={String(open)}
        className="relative mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-gradient-custom border border-cyan-700 shadow-md shadow-cyan-600 px-4 py-2 lg:hidden"
      >
        {/* TOP ROW: Logo | CartButton + Hamburger */}
        <div className="flex w-full flex-row items-center justify-between gap-3">
          <Logo />

          <div className="flex items-center gap-3">
            {/* Cart button u sredini */}
            <div className="scale-90 origin-center mr-1">
              <CartButton />
             </div>
            {/* Hamburger / X */}
            {open ? (
              <IconX
                className="text-white cursor-pointer"
                onClick={() => setOpen(!open)}
              />
            ) : (
              <IconMenu2
                className="text-white cursor-pointer"
                onClick={() => setOpen(!open)}
              />
            )}
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 top-16 z-20 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-blue-900/95 px-4 py-8"
            >
              {navItems.map((navItem: NavItem, idx: number) => (
                <div key={`navItem-${idx}`} className="w-full">
                  {navItem.children || navItem.products ? (
                    <MobileChildNavItems navItem={navItem} />
                  ) : (
                    <Link
                      href={navItem.link}
                      className="relative text-neutral-300"
                    >
                      <motion.span className="block">
                        {navItem.name}
                      </motion.span>
                    </Link>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-center my-2">
                <DyslexiaToggle />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default MobileNav;