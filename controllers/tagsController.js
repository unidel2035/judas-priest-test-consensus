const Tag = require('../models/Tag');
const Note = require('../models/Note');

exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotesByTag = async (req, res) => {
  try {
    const tag = await Tag.findOne({ name: req.params.tagName });
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    const notes = await Note.find({ tags: tag._id }).populate('tags');
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};