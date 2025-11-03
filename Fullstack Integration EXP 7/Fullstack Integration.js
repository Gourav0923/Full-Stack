// Fullstack Integration Practice 1
// This file demonstrates basic frontend-backend integration

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// Serve the main HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Integration Practice 1</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 50px; }
        button { padding: 10px 20px; margin: 10px; cursor: pointer; }
        #result { margin-top: 20px; padding: 10px; border: 1px solid #ccc; }
      </style>
    </head>
    <body>
      <h1>Fullstack Integration Practice 1</h1>
      <p>Click the button to fetch data from the backend:</p>
      <button onclick="fetchData()">Get Data</button>
      <div id="result"></div>
      
      <script>
        async function fetchData() {
          try {
            const response = await fetch('/api/data');
            const data = await response.json();
            document.getElementById('result').innerHTML = 
              '<strong>Response from Backend:</strong><br>' + 
              JSON.stringify(data, null, 2);
          } catch (error) {
            document.getElementById('result').innerHTML = 
              '<strong>Error:</strong> ' + error.message;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// API endpoint
app.get('/api/data', (req, res) => {
  res.json({
    message: 'Hello from Integration Practice 1!',
    timestamp: new Date().toISOString(),
    data: {
      practice: 1,
      status: 'success'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Integration server running on http://localhost:${PORT}`);
});
