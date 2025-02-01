const Task = require("../models/Task");

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).select("-__v");
    console.log("✅ Fetched tasks:", tasks);
    res.json(tasks.map((task) => ({ ...task.toObject(), id: task._id })));
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

exports.addTask = async (req, res) => {
  try {
    console.log("🔄 Received task creation request:", req.body);
    const { title, description, date, time, reminder } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      date,
      time,
      reminder,
      completed: false,
    });

    console.log("✅ Task saved to MongoDB:", task);
    res.status(201).json({ ...task.toObject(), id: task._id });
  } catch (error) {
    console.error("❌ Error adding task:", error);
    res.status(500).json({ message: "Error creating task" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log(`🛠️ Updating task: ${taskId}`);

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("✅ Task updated:", task);
    res.json({ ...task.toObject(), id: task._id });
  } catch (error) {
    console.error("❌ Error updating task:", error);
    res.status(500).json({ message: "Error updating task" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log(`🗑️ Deleting task: ${taskId}`);

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    const task = await Task.findOneAndDelete({
      _id: taskId,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("✅ Task deleted:", task);
    res.json({ message: "Task deleted successfully", id: taskId });
  } catch (error) {
    console.error("❌ Error deleting task:", error);
    res.status(500).json({ message: "Error deleting task" });
  }
};

exports.toggleTaskCompletion = async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log(`🔄 Toggling completion for task: ${taskId}`);

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    const task = await Task.findOne({ _id: taskId, user: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = !task.completed;
    await task.save();

    console.log("✅ Task toggled:", task);
    res.json({ ...task.toObject(), id: task._id });
  } catch (error) {
    console.error("❌ Error toggling task completion:", error);
    res.status(500).json({ message: "Error toggling task completion" });
  }
};
