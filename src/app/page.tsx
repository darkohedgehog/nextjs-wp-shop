import { HeroSectionTwo } from "@/components/mainpage/herosection/HeroSectionTwo";
import { IntroductionSection } from "@/components/mainpage/introduction/IntroductionSection";
import FeaturedProducts from "@/components/product/FeaturedProducts";



export default function Home() {
  return (
    <>
    <HeroSectionTwo/>
    <FeaturedProducts count={8} />
    <IntroductionSection />
    </>
  );
}
