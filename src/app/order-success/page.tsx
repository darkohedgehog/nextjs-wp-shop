import OrderSuccessClient from "@/components/orders/OrderSuccessClient";
import { Suspense } from "react";


export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-4 flex items-center justify-center secondary-color">
      Učitavanje narudžbe…
      </div>}>
      <OrderSuccessClient />
    </Suspense>
  );
}