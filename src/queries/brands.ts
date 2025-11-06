import { gql } from '@apollo/client';

export const GET_PWB_BRANDS = gql`
  query GetPwbBrands {
    pwbBrands(first: 200) {
      nodes {
        id
        name
        slug
        count
      }
    }
  }
`;