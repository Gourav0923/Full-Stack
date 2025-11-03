// Authentication System Practice 2
// Advanced authentication with JWT tokens and password hashing

const express = require('express');
const crypto = require('crypto');
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory user database and sessions
let users = [];
let sessions = {};

// Simple password hashing function (in production, use bcrypt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate simple session token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Practice 2 - JWT & Sessions</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 450px; width: 90%; }
        h1 { color: #333; text-align: center; margin-bottom: 30px; font-size: 28px; }
        .tabs { display: flex; margin-bottom: 25px; border-bottom: 2px solid #e0e0e0; }
        .tab { flex: 1; padding: 12px; text-align: center; cursor: pointer; color: #666; transition: all 0.3s; }
        .tab.active { color: #667eea; border-bottom: 3px solid #667eea; font-weight: 600; }
        .form-container { display: none; }
        .form-container.active { display: block; animation: fadeIn 0.3s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        input { width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; transition: border 0.3s; }
        input:focus { outline: none; border-color: #667eea; }
        button { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; margin-top: 15px; transition: transform 0.2s; }
        button:hover { transform: translateY(-2px); }
        button:active { transform: translateY(0); }
        #message { margin-top: 20px; padding: 12px; border-radius: 8px; text-align: center; animation: slideIn 0.3s; }
        @keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        #dashboard { display: none; }
        #dashboard.active { display: block; animation: fadeIn 0.3s; }
        .user-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .logout-btn { background: #dc3545; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div id="auth-section">
          <h1>🔐 Secure Authentication</h1>
          <div class="tabs">
            <div class="tab active" onclick="showTab('register')">Register</div>
            <div class="tab" onclick="showTab('login')">Login</div>
          </div>
          
          <div id="register" class="form-container active">
            <h2>Create Account</h2>
            <form onsubmit="handleRegister(event)">
              <input type="text" id="reg-username" placeholder="Username" required minlength="3">
              <input type="email" id="reg-email" placeholder="Email" required>
              <input type="password" id="reg-password" placeholder="Password" required minlength="6">
              <input type="password" id="reg-confirm" placeholder="Confirm Password" required>
              <button type="submit">Create Account</button>
            </form>
          </div>
          
          <div id="login" class="form-container">
            <h2>Welcome Back</h2>
            <form onsubmit="handleLogin(event)">
              <input type="text" id="login-username" placeholder="Username" required>
              <input type="password" id="login-password" placeholder="Password" required>
              <button type="submit">Sign In</button>
            </form>
          </div>
          
          <div id="message"></div>
        </div>
        
        <div id="dashboard">
          <h1>🎉 Welcome!</h1>
          <div class="user-info" id="user-info"></div>
          <button class="logout-btn" onclick="handleLogout()">Logout</button>
        </div>
      </div>
      
      <script>
        let currentToken = null;
        
        function showTab(tab) {
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));
          event.target.classList.add('active');
          document.getElementById(tab).classList.add('active');
          document.getElementById('message').innerHTML = '';
        }
        
        async function handleRegister(e) {
          e.preventDefault();
          
          const password = document.getElementById('reg-password').value;
          const confirm = document.getElementById('reg-confirm').value;
          
          if (password !== confirm) {
            showMessage('Passwords do not match!', false);
            return;
          }
          
          const userData = {
            username: document.getElementById('reg-username').value,
            email: document.getElementById('reg-email').value,
            password: password
          };
          
          try {
            const response = await fetch('/api/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            showMessage(result.message, response.ok);
            
            if (response.ok) {
              e.target.reset();
              setTimeout(() => showTab('login'), 1500);
            }
          } catch (error) {
            showMessage('Error: ' + error.message, false);
          }
        }
        
        async function handleLogin(e) {
          e.preventDefault();
          
          const credentials = {
            username: document.getElementById('login-username').value,
            password: document.getElementById('login-password').value
          };
          
          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials)
            });
            
            const result = await response.json();
            
            if (response.ok) {
              currentToken = result.token;
              showDashboard(result.user);
            } else {
              showMessage(result.message, false);
            }
          } catch (error) {
            showMessage('Error: ' + error.message, false);
          }
        }
        
        function showDashboard(user) {
          document.getElementById('auth-section').style.display = 'none';
          document.getElementById('dashboard').classList.add('active');
          document.getElementById('user-info').innerHTML = `
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>User ID:</strong> ${user.id}</p>
            <p><strong>Session Token:</strong> ${currentToken.substring(0, 20)}...</p>
          `;
        }
        
        async function handleLogout() {
          try {
            await fetch('/api/logout', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + currentToken
              }
            });
          } catch (error) {
            console.error('Logout error:', error);
          }
          
          currentToken = null;
          document.getElementById('auth-section').style.display = 'block';
          document.getElementById('dashboard').classList.remove('active');
          showMessage('Logged out successfully', true);
        }
        
        function showMessage(text, isSuccess) {
          const messageDiv = document.getElementById('message');
          messageDiv.innerHTML = text;
          messageDiv.className = isSuccess ? 'success' : 'error';
        }
      </script>
    </body>
    </html>
  `);
});

// Registration endpoint
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password: hashPassword(password),
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  res.status(201).json({ message: 'Registration successful! Please login.', userId: newUser.id });
});

// Login endpoint with session token
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === hashPassword(password));
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  
  const token = generateToken();
  sessions[token] = {
    userId: user.id,
    username: user.username,
    createdAt: Date.now()
  };
  
  res.json({ 
    message: 'Login successful',
    token,
    user: { 
      id: user.id, 
      username: user.username, 
      email: user.email 
    }
  });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token && sessions[token]) {
    delete sessions[token];
    return res.json({ message: 'Logged out successfully' });
  }
  
  res.status(400).json({ message: 'Invalid session' });
});

// Protected route example
app.get('/api/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !sessions[token]) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const session = sessions[token];
  const user = users.find(u => u.id === session.userId);
  
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt
  });
});

app.listen(PORT, () => {
  console.log(`Authentication Practice 2 with JWT & Sessions running on http://localhost:${PORT}`);
});
