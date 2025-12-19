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

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('tags');
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    // Update tags if provided
    let tagIds = [];
    if (tags && Array.isArray(tags)) {
      const tagPromises = tags.map(async tagName => {
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
          tag = new Tag({ name: tagName });
          await tag.save();
        }
        return tag._id;
      });
      
      tagIds = await Promise.all(tagPromises);
    }
    
    const updateData = { title, content };
    if (tags && Array.isArray(tags)) {
      updateData.tags = tagIds;
    }
    
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('tags');
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};