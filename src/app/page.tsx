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

type PopularProductsSectionProps = {};
const PopularProductsSection = dynamic<PopularProductsSectionProps>(
  () =>
    import(
      "@/components/mainpage/popular_products/PopularProductsSection"
    ),
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

const FaqSection = dynamic<FeaturedProductsProps>(
  () => import("@/components/mainpage/faqsection/FaqSection"),
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
      <FaqSection />
    </>
  );
}