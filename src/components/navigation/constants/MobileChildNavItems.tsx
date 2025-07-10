"use client";
import { IconChevronDown } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import React, { useState } from "react";


const MobileChildNavItems = ({ navItem }: { navItem: any }) => {
    const [open, setOpen] = useState(false);
    return (
      <motion.div className="overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="relative flex w-full justify-between text-neutral-600 dark:text-neutral-300"
        >
          <motion.span className="block">{navItem.name}</motion.span>
          <IconChevronDown className="text-neutral-700 dark:text-neutral-300" />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0 }}
              className="pl-4"
            >
              {navItem.children.map((child: any, childIdx: number) => (
                <Link
                  key={`child-${childIdx}`}
                  href={child.link}
                  className="relative text-neutral-600 dark:text-neutral-300"
                >
                  <motion.span className="block">{child.name}</motion.span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  export default MobileChildNavItems;