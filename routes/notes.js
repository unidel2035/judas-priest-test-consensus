const express = require('express');
const router = express.Router();
const { createNote, getNotes, getNoteById, updateNote, deleteNote } = require('../controllers/notesController');

router.post('/notes', createNote);
router.get('/notes', getNotes);
router.get('/notes/:id', getNoteById);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);

module.exports = router;