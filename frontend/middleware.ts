import { rewrite } from '@vercel/functions';

export const config = {
  matcher: ['/api/:path*', '/apidocs', '/openapi.json', '/:code([A-Za-z0-9]{6})'],
};

export default function middleware(request: Request) {
  const backendUrl = process.env['BACKEND_URL'];
  if (!backendUrl) {
    return new Response('BACKEND_URL is not configured', { status: 500 });
  }

  const { pathname, search } = new URL(request.url);
  return rewrite(new URL(pathname + search, backendUrl));
}
