// Authentication System Practice 1
// Basic user registration and login system

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory user database
let users = [];

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Practice 1</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 50px; background: #f0f0f0; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        form { margin: 20px 0; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        #message { margin-top: 20px; padding: 10px; border-radius: 5px; text-align: center; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .tabs { display: flex; margin-bottom: 20px; }
        .tab { flex: 1; padding: 10px; text-align: center; cursor: pointer; background: #e9ecef; }
        .tab.active { background: #007bff; color: white; }
        .form-container { display: none; }
        .form-container.active { display: block; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Authentication System</h1>
        <div class="tabs">
          <div class="tab active" onclick="showTab('register')">Register</div>
          <div class="tab" onclick="showTab('login')">Login</div>
        </div>
        
        <div id="register" class="form-container active">
          <h2>Register</h2>
          <form onsubmit="handleRegister(event)">
            <input type="text" id="reg-username" placeholder="Username" required>
            <input type="email" id="reg-email" placeholder="Email" required>
            <input type="password" id="reg-password" placeholder="Password" required>
            <button type="submit">Register</button>
          </form>
        </div>
        
        <div id="login" class="form-container">
          <h2>Login</h2>
          <form onsubmit="handleLogin(event)">
            <input type="text" id="login-username" placeholder="Username" required>
            <input type="password" id="login-password" placeholder="Password" required>
            <button type="submit">Login</button>
          </form>
        </div>
        
        <div id="message"></div>
      </div>
      
      <script>
        function showTab(tab) {
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));
          event.target.classList.add('active');
          document.getElementById(tab).classList.add('active');
          document.getElementById('message').innerHTML = '';
        }
        
        async function handleRegister(e) {
          e.preventDefault();
          
          const userData = {
            username: document.getElementById('reg-username').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value
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
            showMessage(result.message, response.ok);
            
            if (response.ok) {
              e.target.reset();
            }
          } catch (error) {
            showMessage('Error: ' + error.message, false);
          }
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
  
  // Check if user already exists
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password, // In production, use bcrypt to hash passwords!
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  res.json({ 
    message: 'Login successful', 
    user: { 
      id: user.id, 
      username: user.username, 
      email: user.email 
    }
  });
});

// Get all users (for testing)
app.get('/api/users', (req, res) => {
  const safeUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    createdAt: u.createdAt
  }));
  res.json({ count: users.length, users: safeUsers });
});

app.listen(PORT, () => {
  console.log(`Authentication System Practice 1 running on http://localhost:${PORT}`);
});
