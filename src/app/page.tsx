import HeroSection from "@/components/mainpage/herosection/HeroSection";
import { IntroductionSection } from "@/components/mainpage/introduction/IntroductionSection";
import FeaturedProducts from "@/components/product/FeaturedProducts";



export default function Home() {
  return (
    <>
    <HeroSection />
    <FeaturedProducts count={8} />
    <IntroductionSection />
    </>
  );
}
