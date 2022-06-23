import { NextRequest } from 'next/server';

// eslint-disable-next-line consistent-return
export async function middleware(req: NextRequest): Promise<Response | void> {
  const { hostname } = new URL(req.url);

  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.CANONICAL_HOSTNAME &&
    process.env.CANONICAL_HOSTNAME !== hostname
  ) {
    return new Response('Forbidden', { status: 403 });
  }
}
