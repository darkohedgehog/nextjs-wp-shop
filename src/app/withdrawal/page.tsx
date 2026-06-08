import type { Metadata } from "next";
import { Suspense } from "react";
import WithdrawalClient from "@/components/withdrawal/WithdrawalClient";
import { buildMetadata } from "@/utils/seo";
import { siteMetaData } from "@/utils/siteMetaData";

export const generateMetadata = (): Metadata => {
  const page = siteMetaData.pages.withdrawal;

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    ogImage: page.banner,
  });
};

export default function WithdrawalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-6 text-zinc-300">
          Učitavanje obrasca...
        </div>
      }
    >
      <WithdrawalClient />
    </Suspense>
  );
}
