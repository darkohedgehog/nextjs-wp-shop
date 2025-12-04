import type { ReactNode } from 'react';

type ShopLayoutProps = {
  children: ReactNode;
};

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}