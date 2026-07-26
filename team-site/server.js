import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import querystring from 'querystring';
import { fileURLToPath } from 'url';
import { parseCookies, signSession, verifySession } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local if present
const envPaths = [
  path.join(__dirname, '.env.local'),
  path.join(__dirname, '..', '.env.local')
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index > 0) {
        const key = trimmed.slice(0, index).trim();
        let val = trimmed.slice(index + 1).trim();
        // Remove quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

const PORT = process.env.APP_PORT || process.env.PORT || 8080;
const CITY = process.env.OPENWEATHER_CITY || 'Colombo';
const API_KEY = process.env.OPENWEATHER_API_KEY;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-session-secret-key-at-least-32-chars-long';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // 1. Google OAuth - Login redirect
  if (pathname === '/api/auth/google') {
    if (!GOOGLE_CLIENT_ID) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Google OAuth Client ID is not configured' }));
    }

    const redirectUri = GOOGLE_REDIRECT_URI || `http://${req.headers.host}/api/auth/google/callback`;
    const state = crypto.randomBytes(16).toString('hex');

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: redirectUri,
      client_id: GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      state: state,
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ].join(' ')
    };

    const consentUrl = `${rootUrl}?${querystring.stringify(options)}`;
    res.writeHead(302, {
      'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`,
      'Location': consentUrl
    });
    return res.end();
  }

  // 2. Google OAuth - Callback
  if (pathname === '/api/auth/google/callback') {
    const code = url.searchParams.get('code');
    const returnedState = url.searchParams.get('state');
    const cookies = parseCookies(req);
    const savedState = cookies['oauth_state'];

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Authorization code missing' }));
    }

    // State verification to prevent CSRF
    if (!returnedState || !savedState || returnedState !== savedState) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'CSRF state verification failed' }));
    }

    const redirectUri = GOOGLE_REDIRECT_URI || `http://${req.headers.host}/api/auth/google/callback`;

    // Code exchange payload
    const tokenPayload = querystring.stringify({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const tokenReq = https.request(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(tokenPayload)
        }
      },
      (tokenRes) => {
        let data = '';
        tokenRes.on('data', (chunk) => { data += chunk; });
        tokenRes.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const access_token = parsed.access_token;

            if (!access_token) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Failed to retrieve access token', details: parsed }));
            }

            // Retrieve user profile information using access token
            https.get(
              `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`,
              (userInfoRes) => {
                let userData = '';
                userInfoRes.on('data', (chunk) => { userData += chunk; });
                userInfoRes.on('end', () => {
                  try {
                    const profile = JSON.parse(userData);
                    const sessionData = {
                      id: profile.id,
                      email: profile.email,
                      name: profile.name,
                      picture: profile.picture,
                      authenticatedAt: new Date().toISOString()
                    };

                    const signedSession = signSession(sessionData, SESSION_SECRET);

                    // Redirect user back home with the signed session cookie (clear oauth_state)
                    res.writeHead(302, {
                      'Set-Cookie': [
                        `session=${signedSession}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
                        `oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
                      ],
                      'Location': '/'
                    });
                    res.end();
                  } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to parse userinfo response' }));
                  }
                });
              }
            ).on('error', (err) => {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to fetch userinfo', details: err.message }));
            });
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to parse token response' }));
          }
        });
      }
    );

    tokenReq.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Token request failed', details: err.message }));
    });

    tokenReq.write(tokenPayload);
    tokenReq.end();
    return;
  }

  // 3. /api/auth/me - check auth status
  if (pathname === '/api/auth/me') {
    const cookies = parseCookies(req);
    const sessionCookie = cookies['session'];
    const user = verifySession(sessionCookie, SESSION_SECRET);

    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ authenticated: false, user: null }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ authenticated: true, user }));
  }

  // 4. /api/auth/logout
  if (pathname === '/api/auth/logout') {
    res.writeHead(302, {
      'Set-Cookie': [
        `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
        `oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
      ],
      'Location': '/'
    });
    return res.end();
  }

  // 5. API Weather endpoint
  if (pathname === '/api/weather') {
    const weatherStatus = {
      task: 'T07',
      provider: 'openweather',
      city: CITY,
      keyExposed: false
    };

    if (!API_KEY) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        ...weatherStatus,
        error: 'OPENWEATHER_API_KEY is not configured',
        weather: null
      }));
    }

    const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(CITY)}&appid=${API_KEY}&units=metric`;

    https.get(openWeatherUrl, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        try {
          if (apiRes.statusCode === 200) {
            const parsed = JSON.parse(data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              ...weatherStatus,
              weather: {
                temp: parsed.main.temp,
                description: parsed.weather[0].description,
                icon: parsed.weather[0].icon,
                humidity: parsed.main.humidity,
                windSpeed: parsed.wind.speed
              }
            }));
          } else {
            res.writeHead(apiRes.statusCode || 500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              ...weatherStatus,
              error: `OpenWeather API returned status code ${apiRes.statusCode}`,
              weather: null
            }));
          }
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            ...weatherStatus,
            error: 'Failed to parse OpenWeather response',
            weather: null
          }));
        }
      });
    }).on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ...weatherStatus,
        error: err.message,
        weather: null
      }));
    });
    return;
  }

  // 6. Status evidence endpoint
  if (pathname === '/status' || pathname === '/status/' || pathname === '/status/index.html') {
    const statusPath = path.join(__dirname, 'status', 'index.html');
    fs.readFile(statusPath, 'utf8', (err, data) => {
      if (err) {
        // Fallback status if the file doesn't exist
        const fallbackStatus = {
          team: process.env.TEAM_SLUG || 'mahasona-squad',
          deploy_time: new Date().toISOString(),
          marker: 'T07',
          'weather.provider': 'openweather',
          weather: { provider: 'openweather' },
          'oauth.google.configured': !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(fallbackStatus));
      }

      try {
        const parsed = JSON.parse(data);
        parsed['weather.provider'] = 'openweather';
        parsed.weather = { provider: 'openweather' };
        parsed['oauth.google.configured'] = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(parsed));
      } catch (e) {
        // If it's not JSON, serve it as plain text
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
    return;
  }

  // 7. Static files serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Basic security check to prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // For SPA routing fallback to index.html if file not found
      filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

