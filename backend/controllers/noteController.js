const Note = require("../models/Notes");
const { io } = require("../server"); // WebSocket instance

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id, isPrivate: false });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes" });
  }
};

exports.getPrivateNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id, isPrivate: true });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching private notes" });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { title, content, tags, isPrivate } = req.body;
    const note = await Note.create({
      user: req.user.id,
      title,
      content,
      tags,
      isPrivate,
    });

    io.emit("noteAdded", note); // Real-time update
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: "Error creating note" });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, tags, isPrivate } = req.body;
    const note = await Note.findByIdAndUpdate(
      noteId,
      { title, content, tags, isPrivate, updatedAt: Date.now() },
      { new: true }
    );

    io.emit("noteUpdated", note); // Real-time update
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "Error updating note" });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    await Note.findByIdAndDelete(noteId);

    io.emit("noteDeleted", noteId); // Real-time update
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note" });
  }
};
