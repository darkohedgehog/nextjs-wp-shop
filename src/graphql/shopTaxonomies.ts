import { gql } from '@apollo/client';

export const GET_TOP_CATEGORIES = gql`
  query GetTopCategories {
    productCategories(where: { parent: 0 }, first: 100) {
      nodes { id name slug }
    }
  }
`;

/**
 * Ako ti je atribut za brendove "pa_brand", ostavi ovako.
 * Ako je drugačiji (npr. pa_proizvodjac), promeni vrednost id: "pa_brand" ⇢ id: "pa_proizvodjac"
 */
export const GET_BRAND_ATTRIBUTE = gql`
  query GetBrandAttribute {
    productAttribute(id: "pa_brand", idType: SLUG) {
      id
      name
      slug
      terms(first: 200) {
        nodes { id name slug }
      }
    }
  }
`;