// Fullstack Integration Practice 3
// Advanced integration with real-time updates using Server-Sent Events

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for tasks
let tasks = [
  { id: 1, title: 'Learn Node.js', status: 'completed' },
  { id: 2, title: 'Build REST API', status: 'in-progress' },
  { id: 3, title: 'Deploy Application', status: 'pending' }
];

// Store active SSE clients
let clients = [];

// Function to send updates to all connected clients
function broadcastUpdate(data) {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Integration Practice 3 - Real-time Updates</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 50px; background: #f5f5f5; }
        .container { max-width: 800px; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        .task { padding: 15px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; }
        .task.completed { background: #d4edda; border-color: #c3e6cb; }
        .task.in-progress { background: #fff3cd; border-color: #ffeaa7; }
        .task.pending { background: #f8d7da; border-color: #f5c6cb; }
        button { padding: 8px 15px; margin: 5px; cursor: pointer; border: none; border-radius: 4px; }
        .delete-btn { background: #dc3545; color: white; }
        .status-btn { background: #007bff; color: white; }
        #addTask { background: #28a745; color: white; padding: 10px 20px; margin-top: 20px; }
        input { padding: 10px; width: 70%; border: 1px solid #ddd; border-radius: 4px; }
        #status { position: fixed; top: 10px; right: 10px; padding: 10px 20px; background: #28a745; color: white; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div id="status">🟢 Connected</div>
      <div class="container">
        <h1>Real-time Task Manager</h1>
        <p>This application uses Server-Sent Events (SSE) for real-time updates!</p>
        
        <div>
          <input type="text" id="taskTitle" placeholder="Enter new task title">
          <button id="addTask" onclick="addTask()">Add Task</button>
        </div>
        
        <div id="tasks"></div>
      </div>
      
      <script>
        let eventSource;
        
        function connectSSE() {
          eventSource = new EventSource('/api/events');
          
          eventSource.onopen = () => {
            document.getElementById('status').innerHTML = '🟢 Connected';
            document.getElementById('status').style.background = '#28a745';
          };
          
          eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            renderTasks(data.tasks);
          };
          
          eventSource.onerror = () => {
            document.getElementById('status').innerHTML = '🔴 Disconnected';
            document.getElementById('status').style.background = '#dc3545';
          };
        }
        
        function renderTasks(tasks) {
          const container = document.getElementById('tasks');
          container.innerHTML = '<h2>Tasks:</h2>';
          
          tasks.forEach(task => {
            container.innerHTML += `
              <div class="task ${task.status}">
                <div>
                  <strong>${task.title}</strong><br>
                  <small>Status: ${task.status}</small>
                </div>
                <div>
                  <button class="status-btn" onclick="updateStatus(${task.id})">Change Status</button>
                  <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                </div>
              </div>
            `;
          });
        }
        
        async function addTask() {
          const title = document.getElementById('taskTitle').value;
          if (!title) return alert('Please enter a task title');
          
          try {
            await fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title })
            });
            document.getElementById('taskTitle').value = '';
          } catch (error) {
            console.error('Error adding task:', error);
          }
        }
        
        async function updateStatus(id) {
          try {
            await fetch('/api/tasks/' + id + '/status', { method: 'PATCH' });
          } catch (error) {
            console.error('Error updating task:', error);
          }
        }
        
        async function deleteTask(id) {
          try {
            await fetch('/api/tasks/' + id, { method: 'DELETE' });
          } catch (error) {
            console.error('Error deleting task:', error);
          }
        }
        
        // Initial load and SSE connection
        connectSSE();
        fetch('/api/tasks').then(r => r.json()).then(data => renderTasks(data.tasks));
      </script>
    </body>
    </html>
  `);
});

// SSE endpoint for real-time updates
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  clients.push(res);
  
  // Send initial data
  res.write(`data: ${JSON.stringify({ tasks })}\n\n`);
  
  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json({ tasks });
});

// POST new task
app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: tasks.length + 1,
    title: req.body.title,
    status: 'pending'
  };
  
  tasks.push(newTask);
  broadcastUpdate({ tasks });
  
  res.status(201).json(newTask);
});

// PATCH task status
app.patch('/api/tasks/:id/status', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  
  const statuses = ['pending', 'in-progress', 'completed'];
  const currentIndex = statuses.indexOf(task.status);
  task.status = statuses[(currentIndex + 1) % statuses.length];
  
  broadcastUpdate({ tasks });
  res.json(task);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  
  const deleted = tasks.splice(index, 1);
  broadcastUpdate({ tasks });
  
  res.json({ message: 'Task deleted', task: deleted[0] });
});

app.listen(PORT, () => {
  console.log(`Integration Practice 3 server with SSE running on http://localhost:${PORT}`);
});
