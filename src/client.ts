import { createClient, dedupExchange, cacheExchange, fetchExchange  } from '@urql/core';
import { ClientFactory } from 'qwik-urql';

export const clientFactory: ClientFactory = () => {
  return createClient({
    url: `${process.env.VENDURE_URL}/shop-api`,
    // fetch: (input, init) => {
    //   const headers = (input instanceof Request ? input.headers : init?.headers || {}) as Record<string, string>;
    //   if (isBrowser) {
    //     const token = getCookie('authToken');
    //     if (token) {
    //       headers['Authorization'] = `Bearer ${token}`;
    //     }
    //   }
    //   return fetch(input, init).then(response => {
    //     if (isBrowser) {
    //       const token = response.headers.get("vendure-auth-token")
    //       if (token) {
    //         setCookie('authToken', token, 365);
    //       }
    //     }
    //     return response
    //   })
    // },
    exchanges: [
      dedupExchange,
      fetchExchange,
      cacheExchange,
    ],
  });
};