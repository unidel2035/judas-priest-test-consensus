const express = require('express');
const router = express.Router();
const { createNote, getNotes } = require('../controllers/notesController');

router.post('/notes', createNote);
router.get('/notes', getNotes);

module.exports = router;