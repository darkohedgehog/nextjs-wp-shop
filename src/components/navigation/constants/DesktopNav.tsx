"use client";
import Logo from "@/components/logo/Logo";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";
import { MenuItem } from "./MenuItem";
import { Menu } from "./Menu";
import { HoveredLink } from "./HoveredLink";
import { ProductItem } from "./ProductItem";
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

type DesktopNavProps = {
  navItems: NavItem[];
};

const DesktopNav = ({ navItems }: DesktopNavProps) => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <motion.div
      className={cn(
        "relative z-60 mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full px-4 py-2 lg:flex bg-gradient-custom border border-cyan-800 shadow-lg shadow-cyan-700",
        "sticky inset-x-0 top-40"
      )}
    >
      <Logo />

      <div className="hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-200 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2">
        <Menu setActive={setActive}>
          {navItems.map((item, idx) => (
            <MenuItem
              key={idx}
              setActive={setActive}
              active={active}
              item={item.name}
            >
              <div className="flex flex-col space-y-4 text-sm">
                {item.children &&
                  item.children.map((child, childIdx) => (
                    <HoveredLink key={childIdx} href={child.link}>
                      {child.name}
                    </HoveredLink>
                  ))}
                {item.products && (
                  <div className="grid grid-cols-2 gap-10 p-4 text-sm">
                    {item.products.map((product, prodIdx) => (
                      <ProductItem
                      key={prodIdx}
                      title={product.title}
                      link={product.href}
                      src={product.src}
                      description={product.description}
                    />
                    ))}
                  </div>
                )}
              </div>
            </MenuItem>
          ))}
        </Menu>
      </div>
      <div className="space-x-5 flex items-center justify-center">
        {/* CART BUTTON */}
      <div className="hidden md:block">
        <CartButton />
      </div>
      {/* DyslexiaToggle BUTTON */}
      <div className="hidden md:block">
        <DyslexiaToggle />
      </div>
      </div>
    </motion.div>
  );
};

export default DesktopNav;