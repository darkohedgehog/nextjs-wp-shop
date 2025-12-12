import { gql } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import FaqSection, { FaqItem } from "./FaqSection";

const GET_FAQS = gql`
  query GetFaqs {
    fAQs(first: 50, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        title
        content
      }
    }
  }
`;

type WPFAQNode = {
  title?: string | null;
  content?: string | null;
};

export default async function FaqSectionServer() {
  const { data } = await client.query<{
    fAQs?: { nodes?: WPFAQNode[] };
  }>({
    query: GET_FAQS,
    fetchPolicy: "no-cache",
  });

  const items: FaqItem[] =
    data?.fAQs?.nodes?.map((n) => ({
      question: n?.title ?? "",
      answer: n?.content ?? "",
    })) ?? [];

  return <FaqSection items={items} />;
}