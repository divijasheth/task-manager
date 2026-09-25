require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());          // allow the React site to call this API
app.use(express.json()); // parse JSON request bodies

app.get("/", (req, res) => res.send("Task Manager API is running"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Server on port " + PORT));
  })
  .catch((err) => console.error("DB error:", err.message));
