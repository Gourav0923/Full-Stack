// Authentication System Practice 3
// Role-based access control (RBAC) with middleware and refreshable sessions

const express = require('express');
const crypto = require('crypto');
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory stores
let users = [
  // Seeded admin
  { id: 1, username: 'admin', email: 'admin@example.com', password: hash('admin123'), role: 'admin', createdAt: new Date().toISOString() }
];
let sessions = {}; // accessToken -> { userId, role, createdAt, refreshToken }

function hash(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}
function token() {
  return crypto.randomBytes(32).toString('hex');
}

// Auth middleware
function requireAuth(req, res, next) {
  const auth = req.headers.authorization?.replace('Bearer ', '');
  if (!auth || !sessions[auth]) return res.status(401).json({ message: 'Unauthorized' });
  req.session = sessions[auth];
  next();
}

// RBAC middleware
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session || !roles.includes(req.session.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Practice 3 - RBAC</title>
      <style>
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin: 40px; }
        .row { display: grid; grid-template-columns: repeat(2, minmax(280px, 1fr)); gap: 24px; }
        section { border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px; }
        input, select, button { padding: 10px; margin: 6px 0; width: 100%; }
        .admin { background: #fef3c7; }
        .manager { background: #e0f2fe; }
        .user { background: #ecfccb; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 6px; }
      </style>
    </head>
    <body>
      <h1>Authentication System - Practice 3 (RBAC)</h1>
      <p>Demo of role-based access with middleware and refresh tokens.</p>

      <div class="row">
        <section>
          <h2>Register</h2>
          <input id="r-username" placeholder="Username" />
          <input id="r-email" placeholder="Email" type="email" />
          <input id="r-password" placeholder="Password" type="password" />
          <select id="r-role">
            <option value="user">user</option>
            <option value="manager">manager</option>
          </select>
          <button onclick="register()">Register</button>
        </section>

        <section>
          <h2>Login</h2>
          <input id="l-username" placeholder="Username" />
          <input id="l-password" placeholder="Password" type="password" />
          <button onclick="login()">Login</button>
          <button onclick="refresh()">Refresh Token</button>
          <button onclick="logout()">Logout</button>
          <p id="token"></p>
        </section>

        <section class="admin">
          <h2>Admin Route</h2>
          <button onclick="call('/api/admin/metrics')">Get Metrics (admin)</button>
          <pre id="admin"></pre>
        </section>

        <section class="manager">
          <h2>Manager Route</h2>
          <button onclick="call('/api/manager/reports')">Get Reports (manager, admin)</button>
          <pre id="manager"></pre>
        </section>

        <section class="user">
          <h2>User Route</h2>
          <button onclick="call('/api/user/me')">My Profile (any logged user)</button>
          <pre id="user"></pre>
        </section>
      </div>

      <script>
        let accessToken = null;
        let refreshToken = null;

        async function register() {
          const body = {
            username: document.getElementById('r-username').value,
            email: document.getElementById('r-email').value,
            password: document.getElementById('r-password').value,
            role: document.getElementById('r-role').value,
          };
          const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          alert((await res.json()).message);
        }

        async function login() {
          const body = {
            username: document.getElementById('l-username').value,
            password: document.getElementById('l-password').value,
          };
          const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          const data = await res.json();
          if (res.ok) {
            accessToken = data.accessToken;
            refreshToken = data.refreshToken;
            document.getElementById('token').textContent = 'Access: ' + accessToken.slice(0, 16) + '...';
          } else {
            alert(data.message);
          }
        }

        async function refresh() {
          if (!refreshToken) return alert('Login first');
          const res = await fetch('/api/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) });
          const data = await res.json();
          if (res.ok) { accessToken = data.accessToken; document.getElementById('token').textContent = 'Access: ' + accessToken.slice(0, 16) + '...'; }
          else alert(data.message);
        }

        async function logout() {
          if (!accessToken) return;
          await fetch('/api/logout', { method: 'POST', headers: { 'Authorization': 'Bearer ' + accessToken } });
          accessToken = null; refreshToken = null; document.getElementById('token').textContent='';
        }

        async function call(path) {
          const res = await fetch(path, { headers: accessToken ? { 'Authorization': 'Bearer ' + accessToken } : {} });
          const text = await res.text();
          const id = path.includes('admin') ? 'admin' : path.includes('manager') ? 'manager' : 'user';
          document.getElementById(id).textContent = text;
        }
      </script>
    </body>
    </html>
  `);
});

// Routes
app.post('/api/register', (req, res) => {
  const { username, email, password, role = 'user' } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  if (users.find(u => u.username === username || u.email === email)) return res.status(400).json({ message: 'User exists' });
  const user = { id: users.length + 1, username, email, password: hash(password), role, createdAt: new Date().toISOString() };
  users.push(user);
  res.status(201).json({ message: 'Registered successfully', id: user.id });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === hash(password));
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const accessToken = token();
  const refreshToken = token();
  sessions[accessToken] = { userId: user.id, role: user.role, createdAt: Date.now(), refreshToken };
  res.json({ message: 'Login successful', accessToken, refreshToken, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

app.post('/api/refresh', (req, res) => {
  const { refreshToken } = req.body;
  const entry = Object.entries(sessions).find(([k,v]) => v.refreshToken === refreshToken);
  if (!entry) return res.status(401).json({ message: 'Invalid refresh token' });
  const [oldAccess, session] = entry;
  delete sessions[oldAccess];
  const newAccess = token();
  sessions[newAccess] = { ...session };
  res.json({ accessToken: newAccess });
});

app.post('/api/logout', requireAuth, (req, res) => {
  const access = Object.keys(sessions).find(k => sessions[k] === req.session);
  if (access) delete sessions[access];
  res.json({ message: 'Logged out' });
});

// Protected
app.get('/api/user/me', requireAuth, (req, res) => {
  const me = users.find(u => u.id === req.session.userId);
  res.json({ id: me.id, username: me.username, email: me.email, role: me.role });
});

app.get('/api/manager/reports', requireAuth, requireRole('manager','admin'), (req, res) => {
  res.json({ reports: [{ id: 1, name: 'Weekly KPI' }, { id: 2, name: 'Monthly Revenue' }] });
});

app.get('/api/admin/metrics', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ users: users.length, activeSessions: Object.keys(sessions).length });
});

app.listen(PORT, () => console.log(`Authentication Practice 3 (RBAC) running on http://localhost:${PORT}`));
