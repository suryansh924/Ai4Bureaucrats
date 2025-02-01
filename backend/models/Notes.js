const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }], // Tags for categorization
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isPrivate: { type: Boolean, default: false }, // Determines if the note is private
});

module.exports = mongoose.model("Note", noteSchema);
