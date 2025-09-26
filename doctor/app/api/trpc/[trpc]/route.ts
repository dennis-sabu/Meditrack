import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';

import { env } from '@/env';
import { createTRPCContext } from '@/server/api/context';
import { appRouter } from '@/server/api/routers';

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling an HTTP request (e.g., when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return await createTRPCContext({
    headers: req.headers,
  });
};
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
const handler = async (req: NextRequest) => {
  const context = await createContext(req); // Ensure we resolve the Promise here
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => context, // Corrected
    onError:
      env.NODE_ENV === 'development'
        ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
        }
        : undefined,
  });
};

export { handler as GET, handler as POST };
