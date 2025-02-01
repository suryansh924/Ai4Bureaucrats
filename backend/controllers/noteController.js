const Note = require("../models/Notes");
// const { io } = require("../server"); // WebSocket instance (if applicable)

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id, isPrivate: false });
    console.log(`📜 Public Notes fetched for user ${req.user.id}:`, notes);
    res.json(notes);
  } catch (error) {
    console.error("❌ Error fetching public notes:", error);
    res.status(500).json({ message: "Error fetching public notes" });
  }
};

exports.getPrivateNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id, isPrivate: true });
    console.log(`🔒 Private Notes fetched for user ${req.user.id}:`, notes);
    res.json(notes);
  } catch (error) {
    console.error("❌ Error fetching private notes:", error);
    res.status(500).json({ message: "Error fetching private notes" });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { title, content, tags, isPrivate } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const note = await Note.create({
      user: req.user.id,
      title,
      content,
      tags: tags || [],
      isPrivate,
    });

    console.log("✅ Note created:", note);

    // if (io) {
    //   io.emit("noteAdded", note);
    // }

    res.status(201).json(note);
  } catch (error) {
    console.error("❌ Error creating note:", error);
    res.status(500).json({ message: "Error creating note" });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, tags, isPrivate } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const note = await Note.findByIdAndUpdate(
      noteId,
      { title, content, tags: tags || [], isPrivate, updatedAt: Date.now() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    console.log("📝 Note updated:", note);

    // if (io) {
    //   io.emit("noteUpdated", note);
    // }

    res.json(note);
  } catch (error) {
    console.error("❌ Error updating note:", error);
    res.status(500).json({ message: "Error updating note" });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await Note.findByIdAndDelete(noteId);

    console.log("🗑️ Note deleted:", noteId);

    // if (io) {
    //   io.emit("noteDeleted", noteId);
    // }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting note:", error);
    res.status(500).json({ message: "Error deleting note" });
  }
};
