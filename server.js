// Simple Task Manager REST API using Express
const express = require('express');
const app = express();
app.use(express.json());

// In-memory task store
let tasks = [];
let nextId = 1;

// GET /tasks - list all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// POST /tasks - create a new task
app.post('/tasks', (req, res) => {
  const { title, description, completed } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const task = {
    id: nextId++,
    title,
    description: description || '',
    completed: completed === true,
  };
  tasks.push(task);
  res.status(201).json(task);
});

// GET /tasks/:id - get a specific task
app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// PUT /tasks/:id - update a task
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  const { title, description, completed } = req.body;
  const existing = tasks[taskIndex];
  const updated = {
    ...existing,
    title: title !== undefined ? title : existing.title,
    description: description !== undefined ? description : existing.description,
    completed: completed !== undefined ? completed : existing.completed,
  };
  tasks[taskIndex] = updated;
  res.json(updated);
});

// DELETE /tasks/:id - delete a task
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(taskIndex, 1);
  res.status(204).end();
});

// Export the app for testing
module.exports = app;
