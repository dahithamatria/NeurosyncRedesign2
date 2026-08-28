// Minimal smoke tests using Node's built-in test runner + assert.
// Requires a running Postgres pointed at by DATABASE_URL (see README).
// Run with: npm test

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('http');

const app = require('../src/app');

function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

function req(server, { method, path, body, token }) {
  const port = server.address().port;
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = request.request(
      {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, body: raw });
          }
        });
      }
    );
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

test('health check responds ok', async () => {
  const server = await listen();
  const res = await req(server, { method: 'GET', path: '/api/health' });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  server.close();
});

test('register -> login -> me -> recommendation happy path', async () => {
  const server = await listen();
  const email = `test-${Date.now()}@example.com`;

  const registerRes = await req(server, {
    method: 'POST',
    path: '/api/auth/register',
    body: { name: 'Test User', email, password: 'password123' },
  });
  assert.equal(registerRes.status, 201);
  assert.ok(registerRes.body.data.token);

  const loginRes = await req(server, {
    method: 'POST',
    path: '/api/auth/login',
    body: { email, password: 'password123' },
  });
  assert.equal(loginRes.status, 200);
  const { token } = loginRes.body.data;

  const meRes = await req(server, { method: 'GET', path: '/api/auth/me', token });
  assert.equal(meRes.status, 200);
  assert.equal(meRes.body.data.user.email, email.toLowerCase());

  const recRes = await req(server, { method: 'GET', path: '/api/recommendations?percent=80', token });
  assert.equal(recRes.status, 200);
  assert.equal(recRes.body.data.tier, 'Level 3');

  server.close();
});

test('login rejects wrong password', async () => {
  const server = await listen();
  const email = `test-${Date.now()}-b@example.com`;

  await req(server, {
    method: 'POST',
    path: '/api/auth/register',
    body: { name: 'Test User', email, password: 'password123' },
  });

  const res = await req(server, {
    method: 'POST',
    path: '/api/auth/login',
    body: { email, password: 'wrong-password' },
  });
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);

  server.close();
});
