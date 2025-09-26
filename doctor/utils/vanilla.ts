import { AppRouter } from '@/server/api/routers';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { loggerLink } from '@trpc/client';
import SuperJSON from 'superjson';

export const links = [
  loggerLink({
    enabled: (op) =>
      process.env.NODE_ENV === 'development' ||
      (op.direction === 'down' && op.result instanceof Error),
  }),
  // unstable_httpBatchStreamLink({
  //   transformer: SuperJSON,
  //   url: `${getBaseUrl()}/api/trpc`,
  //   async fetch(url,options)

  // }),
  httpBatchLink({
    transformer: SuperJSON,
    url: '/api/trpc',
    headers: () => {
      const headers = new Headers();
      headers.set('x-trpc-source', 'nextjs-react');
      return headers;
    },
    async fetch(url, options) {
      try {
        return await fetch(url, options);
      } catch (error) {
        console.error('Error in tRPC request:', error);
        return new Response(null, { status: 503 }); // Return service unavailable
      }
    },
  }),
];

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const api = createTRPCClient<AppRouter>({
  links,
});
