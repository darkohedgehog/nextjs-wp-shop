import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http'; // ✅ umesto createHttpLink
import { SetContextLink } from '@apollo/client/link/context';
import { getPublicGraphqlUrl, getServerGraphqlUrl } from '@/lib/wordpress-endpoints';

const isServer = typeof window === 'undefined';
const publicGraphqlUrl = getPublicGraphqlUrl();
const serverGraphqlUrl = getServerGraphqlUrl();

const httpLink = new HttpLink({
  // Server renders may use WP_INTERNAL_GRAPHQL_URL; browser calls must stay on the public endpoint.
  uri: isServer ? serverGraphqlUrl : publicGraphqlUrl,
  fetch: isServer
    ? async (input, init) => {
        try {
          return await fetch(input, init);
        } catch (error) {
          if (serverGraphqlUrl !== publicGraphqlUrl) {
            return fetch(publicGraphqlUrl, init);
          }
          throw error;
        }
      }
    : undefined,
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
