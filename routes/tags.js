const express = require('express');
const router = express.Router();
const { getTags, getNotesByTag } = require('../controllers/tagsController');

router.get('/tags', getTags);
router.get('/tags/:tagName/notes', getNotesByTag);

module.exports = router;