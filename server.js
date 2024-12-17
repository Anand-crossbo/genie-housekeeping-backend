// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Store tasks
let tasks = [];

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Send current tasks to newly connected client
  ws.send(JSON.stringify({ type: 'tasks', data: tasks }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// API endpoint to create new task
app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: tasks.length + 1,
    title: req.body.serviceName,
    RoomNumber: parseInt(req.body.roomNumber),
    RequestedAt: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }),
    AssignedTo: req.body.assignedTo || 'Pending',
    indicatorColor: '#e73d3d',
    timeStatus: 0,
  };

  tasks.push(newTask);

  // Broadcast to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'taskAdded', data: tasks }));
    }
  });

  res.status(201).json(newTask);
});

const PORT = 3008;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});