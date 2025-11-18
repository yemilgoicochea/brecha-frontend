// MSW server (optional). If you add handlers, jest setup will use it.
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  // Example placeholder handler
  rest.get('/api/health', (_req, res, ctx) => res(ctx.json({ ok: true })))
);
