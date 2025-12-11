import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http'; // ✅ umesto createHttpLink
import { SetContextLink } from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: 'https://wp.zivic-elektro.shop/graphql',
});

const authLink = new SetContextLink((prevContext) => {
  let token: string | null = null;

  // JWT token sa klijenta
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('wp_jwt');
  }

  return {
    headers: {
      ...(prevContext.headers || {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});