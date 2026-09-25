const express = require("express");
const auth = require("../middleware/auth");
const Task = require("../models/Task");

const router = express.Router();
router.use(auth); // every task route requires login

// GET /api/tasks?status=todo  -> list my tasks (optional filter)
router.get("/", async (req, res) => {
  const filter = { user: req.userId };
  if (req.query.status) filter.status = req.query.status;
  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.json(tasks);
});

// POST /api/tasks -> create
router.post("/", async (req, res) => {
  const { title, priority, dueDate } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });
  const task = await Task.create({ user: req.userId, title, priority, dueDate: dueDate || undefined });
  res.status(201).json(task);
});

// PUT /api/tasks/:id -> update (title, status, priority, dueDate)
router.put("/:id", async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.userId }, // only my own tasks
    req.body,
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

// DELETE /api/tasks/:id -> delete
router.delete("/:id", async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json({ message: "Task deleted" });
});

module.exports = router;
