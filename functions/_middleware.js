export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Skip known routes
  if (path === '/' || path === '/en' || path === '/zh' ||
      path.startsWith('/en/') || path.startsWith('/zh/') ||
      path.startsWith('/_next/') || path.startsWith('/api/') ||
      path.includes('.')) {
    return context.next();
  }

  // Check if path looks like a base32 secret (16+ chars, A-Z2-7)
  const segment = path.slice(1); // remove leading /
  if (/^[A-Za-z2-7]{16,}$/.test(segment)) {
    // Rewrite to serve /en.html with the secret in path
    const asset = await context.env.ASSETS.fetch(new URL('/en.html', url.origin));
    return new Response(asset.body, {
      headers: asset.headers,
      status: 200,
    });
  }

  return context.next();
}
