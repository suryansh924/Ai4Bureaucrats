const express = require("express");
const {
  createTask,
  getTasks,
  updateTaskCompletion,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.put("/:taskId", protect, updateTaskCompletion); // Toggle completion
router.delete("/:taskId", protect, deleteTask);

module.exports = router;
