const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'chat.db'));

// Create messages table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);

  // Send message history to new client
  const messages = db.prepare('SELECT * FROM messages ORDER BY timestamp ASC').all();
  ws.send(JSON.stringify({
    type: 'history',
    messages: messages
  }));

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const { username, message } = JSON.parse(data);

      // Save message to database
      const stmt = db.prepare('INSERT INTO messages (username, message) VALUES (?, ?)');
      const result = stmt.run(username, message);

      // Get the saved message with timestamp
      const savedMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);

      // Broadcast to all connected clients
      const broadcastData = JSON.stringify({
        type: 'message',
        message: savedMessage
      });

      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcastData);
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// REST API endpoints
app.get('/api/messages', (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM messages ORDER BY timestamp ASC').all();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.delete('/api/messages', (req, res) => {
  try {
    db.prepare('DELETE FROM messages').run();
    res.json({ message: 'All messages deleted' });
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ error: 'Failed to delete messages' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(`Database initialized`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
