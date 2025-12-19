const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connection status
    const dbState = mongoose.connection.readyState;
    let dbStatus;
    
    switch (dbState) {
      case 0:
        dbStatus = 'disconnected';
        break;
      case 1:
        dbStatus = 'connected';
        break;
      case 2:
        dbStatus = 'connecting';
        break;
      case 3:
        dbStatus = 'disconnecting';
        break;
      default:
        dbStatus = 'unknown';
    }
    
    res.status(200).json({
      status: 'OK',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Server is running properly'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: error.message,
      timestamp: new Date().toISOString(),
      message: 'Database connection check failed'
    });
  }
});

module.exports = router;