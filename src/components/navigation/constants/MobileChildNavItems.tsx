"use client";
import { IconChevronDown } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { ProductItem } from "./ProductItem";

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

const MobileChildNavItems = ({ navItem }: { navItem: NavItem }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex w-full justify-between text-neutral-300"
      >
        <motion.span className="block">{navItem.name}</motion.span>
        <IconChevronDown className="text-neutral-300" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0 }}
            className="pl-4"
          >
            {navItem.children &&
              navItem.children.map((child, childIdx) => (
                <Link
                  key={`child-${childIdx}`}
                  href={child.link}
                  className="relative text-neutral-300"
                >
                  <motion.span className="block">{child.name}</motion.span>
                </Link>
              ))}

            {navItem.products &&
              navItem.products.map((product, prodIdx) => (
                <ProductItem
                      key={prodIdx}
                      title={product.title}
                      link={product.href}
                      src={product.src}
                      description={product.description}
                    />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default MobileChildNavItems;