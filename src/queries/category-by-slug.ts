import { gql } from "@apollo/client";

export const GET_CATEGORY_BY_SLUG = gql`
  query CategoryBySlug($slug: ID!) {
    productCategory(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
    }
  }
`;