import FaqSectionServer from "@/components/mainpage/faqsection/FaqSectionServer";
import dynamic from "next/dynamic";

const HeroSectionTwo = dynamic(
  () =>
    import("@/components/mainpage/herosection/HeroSectionTwo").then(
      (m) => m.HeroSectionTwo
    ),
);

const IntroductionSection = dynamic(
  () =>
    import("@/components/mainpage/introduction/IntroductionSection").then(
      (m) => m.IntroductionSection
    ),
);

const PopularProductsSection = dynamic(
  () => import("@/components/mainpage/popular_products/PopularProductsSection"),
  {
    ssr: true,
  }
);

type FeaturedProductsProps = {
  count?: number;
};
const FeaturedProducts = dynamic<FeaturedProductsProps>(
  () => import("@/components/product/FeaturedProducts"),
  {
    ssr: true,
  }
);

const BlogIntroSection = dynamic(
  () => import("@/components/blog/BlogIntroSection"),
  {
    ssr: true,
  }
);

const InfoBanner = dynamic(
  () => import("@/components/mainpage/info/InfoBanner"),
  {
    ssr: true,
  }
);


export default function Home() {
  return (
    <>
      <HeroSectionTwo />
      <FeaturedProducts count={8} />
      <IntroductionSection />
      <PopularProductsSection />
      <BlogIntroSection />
      <InfoBanner />
      <FaqSectionServer  />
    </>
  );
}