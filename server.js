const express = require('express');
const mongoose = require('mongoose');
const noteRoutes = require('./routes/notes');
const tagRoutes = require('./routes/tags');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api', noteRoutes);
app.use('/api', tagRoutes);
app.use('/api', healthRoutes);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/notesdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});