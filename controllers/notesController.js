const Note = require('../models/Note');
const Tag = require('../models/Tag');

exports.createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    // Create tags if they don't exist
    const tagPromises = tags.map(async tagName => {
      let tag = await Tag.findOne({ name: tagName });
      if (!tag) {
        tag = new Tag({ name: tagName });
        await tag.save();
      }
      return tag._id;
    });
    
    const tagIds = await Promise.all(tagPromises);
    
    const note = new Note({
      title,
      content,
      tags: tagIds
    });
    
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate('tags');
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};