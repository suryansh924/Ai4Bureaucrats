const Task = require("../models/Task");
const { io } = require("../server"); // WebSocket instance

exports.createTask = async (req, res) => {
  try {
    const { title, description, date, time } = req.body;
    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      date,
      time,
      completed: false,
    });

    io.emit("taskAdded", task); // Emit real-time update
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error creating task" });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

exports.updateTaskCompletion = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.completed = !task.completed;
    await task.save();

    io.emit("taskUpdated", task); // Emit real-time update
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    await Task.findByIdAndDelete(taskId);

    io.emit("taskDeleted", taskId); // Emit real-time update
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
};
