import ContactUs from "@/components/contact/ContactUs";
import type { Metadata } from "next";
import { buildMetadata } from "@/utils/seo";
import { siteMetaData } from "@/utils/siteMetaData";

export const generateMetadata = (): Metadata => {
  const page = siteMetaData.pages.contact;

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    ogImage: page.banner,
  });
};
const ContactPage = () => {
  return (
    <section>
    <ContactUs />
    </section>
  )
}

export default ContactPage;