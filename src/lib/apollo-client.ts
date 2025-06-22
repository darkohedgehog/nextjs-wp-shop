// lib/apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// 1) HTTP link ka tvoj GraphQL endpointu
const httpLink = createHttpLink({
  uri: 'https://wp.zivic-elektro.shop/graphql',
});

// 2) Auth link koji ubacuje Authorization header samo ako postoji token
const authLink = setContext((_, { headers }) => {
  // na serveru localStorage nije dostupan, pa guardamo
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('wp_jwt');
  }
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// 3) Klijent koji najprije ide kroz authLink, pa kroz httpLink
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
