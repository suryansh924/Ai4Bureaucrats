const express = require("express");
const {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getTasks);
router.post("/", protect, addTask);
router.put("/:taskId", protect, updateTask);
router.delete("/:taskId", protect, deleteTask);
router.patch("/:taskId/toggle", protect, toggleTaskCompletion);

module.exports = router;
