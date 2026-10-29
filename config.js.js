// Cloudflare Pages Function  ->  served at  /config.js
//
// apk.html and "FFX security 1.0.html" load <script src="/config.js"> and read
// window.APP_CONFIG.BACKEND_URL. The old Node/Render server generated this file
// from its environment variables. On Cloudflare Pages (static hosting) nothing
// generated it, so the Environment Variable never reached the browser.
// This Function does exactly that job again: it reads the variable from
// Cloudflare (Settings -> Variables and Secrets) and returns it as a script.
//
// If the variable is not set, APP_CONFIG is empty and the HTML files keep using
// their built-in fallback URL, so nothing breaks.

// First non-empty variable wins (BACKEND_URL is the one the HTML files expect).
const URL_NAMES = ['BACKEND_URL', 'SERVER_URL', 'API_URL', 'API_BASE'];

function pickBackendUrl(env) {
  for (const name of URL_NAMES) {
    const v = env && env[name];
    if (typeof v === 'string' && v.trim()) {
      return v.trim().replace(/\/+$/, ''); // drop trailing slash(es)
    }
  }
  return '';
}

export function onRequest({ env }) {
  const config = {};
  const backendUrl = pickBackendUrl(env);
  if (backendUrl) config.BACKEND_URL = backendUrl;

  // Escape "<" so the value can never break out of the script context.
  const json = JSON.stringify(config).replace(/</g, '\\u003c');

  return new Response(`window.APP_CONFIG = ${json};\n`, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store', // env changes take effect immediately
    },
  });
}
