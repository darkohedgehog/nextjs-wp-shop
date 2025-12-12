import AboutUs from '@/components/about/AboutUs';
import type { Metadata } from "next";
import { buildMetadata } from "@/utils/seo";
import { siteMetaData } from "@/utils/siteMetaData";

export const generateMetadata = (): Metadata => {
  const page = siteMetaData.pages.about;

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    ogImage: page.banner,
  });
};

const AboutPage = () => {
  return (
    <section>
    <AboutUs />
    </section>
  )
}

export default AboutPage;