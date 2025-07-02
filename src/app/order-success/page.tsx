import OrderSuccessClient from "@/components/orders/OrderSuccessClient";
import { Suspense } from "react";


export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-4">Učitavanje narudžbe…</div>}>
      <OrderSuccessClient />
    </Suspense>
  );
}