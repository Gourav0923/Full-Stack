// Fullstack Integration Practice 2
// This file demonstrates form handling and POST requests

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage
let submissions = [];

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Integration Practice 2 - Forms</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 50px; }
        form { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
        input, textarea { width: 100%; padding: 8px; margin: 5px 0; }
        button { padding: 10px 20px; margin-top: 10px; cursor: pointer; background: #007bff; color: white; border: none; }
        #submissions { margin-top: 30px; }
        .submission { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>Fullstack Integration Practice 2</h1>
      <h2>Submit Form Data</h2>
      
      <form id="userForm">
        <label>Name:</label>
        <input type="text" id="name" required>
        
        <label>Email:</label>
        <input type="email" id="email" required>
        
        <label>Message:</label>
        <textarea id="message" rows="4" required></textarea>
        
        <button type="submit">Submit</button>
      </form>
      
      <button onclick="loadSubmissions()">Load All Submissions</button>
      
      <div id="submissions"></div>
      
      <script>
        document.getElementById('userForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
          };
          
          try {
            const response = await fetch('/api/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            alert('Form submitted successfully!');
            document.getElementById('userForm').reset();
            loadSubmissions();
          } catch (error) {
            alert('Error: ' + error.message);
          }
        });
        
        async function loadSubmissions() {
          try {
            const response = await fetch('/api/submissions');
            const data = await response.json();
            
            const container = document.getElementById('submissions');
            container.innerHTML = '<h2>All Submissions:</h2>';
            
            data.submissions.forEach((sub, index) => {
              container.innerHTML += `
                <div class="submission">
                  <strong>Submission ${index + 1}</strong><br>
                  Name: ${sub.name}<br>
                  Email: ${sub.email}<br>
                  Message: ${sub.message}<br>
                  Time: ${sub.timestamp}
                </div>
              `;
            });
          } catch (error) {
            console.error('Error loading submissions:', error);
          }
        }
      </script>
    </body>
    </html>
  `);
});

// POST endpoint to receive form submissions
app.post('/api/submit', (req, res) => {
  const { name, email, message } = req.body;
  
  const submission = {
    name,
    email,
    message,
    timestamp: new Date().toISOString()
  };
  
  submissions.push(submission);
  
  res.json({
    success: true,
    message: 'Form submitted successfully',
    submission
  });
});

// GET endpoint to retrieve all submissions
app.get('/api/submissions', (req, res) => {
  res.json({
    count: submissions.length,
    submissions
  });
});

app.listen(PORT, () => {
  console.log(`Integration Practice 2 server running on http://localhost:${PORT}`);
});
