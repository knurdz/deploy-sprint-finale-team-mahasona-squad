// AI-REVIEW-MARKER: participant must manually remove this marker
import crypto from 'crypto';

// Helper to parse cookies
export function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name.trim();
    if (!name) return;
    const val = rest.join('=').trim();
    list[name] = decodeURIComponent(val);
  });

  return list;
}

// Helper to sign session data
export function signSession(data, secret) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

// Helper to verify and parse session data
export function verifySession(cookieValue, secret) {
  if (!cookieValue) return null;
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (signature !== expectedSignature) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch (e) {
    return null;
  }
}
