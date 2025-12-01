import { gql } from "@apollo/client";

export const GET_POPULAR_PRODUCTS = gql`
  query PopularProductsByCategory($categoryId: Int!) {
    products(
      first: 4
      where: {
        categoryId: $categoryId
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        id
        name
        slug
        ... on SimpleProduct {
          price
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;