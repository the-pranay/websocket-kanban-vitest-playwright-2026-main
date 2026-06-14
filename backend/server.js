const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files as static assets
app.use("/uploads", express.static(uploadsDir));

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not supported. Allowed: images, PDF, TXT, DOC, DOCX"));
    }
  },
});

// File upload endpoint
app.post("/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
    });
  });
});

// In-memory task store
let tasks = [];
let nextId = 1;

function generateId() {
  return `task-${nextId++}-${Date.now()}`;
}

// WebSocket events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send all existing tasks to newly connected client
  socket.emit("sync:tasks", tasks);

  // Create a new task
  socket.on("task:create", (data) => {
    const task = {
      id: generateId(),
      title: data.title || "Untitled Task",
      description: data.description || "",
      column: data.column || "todo",
      priority: data.priority || "medium",
      category: data.category || "feature",
      attachments: data.attachments || [],
      createdAt: new Date().toISOString(),
    };
    tasks.push(task);
    io.emit("task:created", task);
    console.log(`Task created: ${task.title} (${task.id})`);
  });

  // Update an existing task
  socket.on("task:update", (data) => {
    const index = tasks.findIndex((t) => t.id === data.id);
    if (index === -1) return;

    tasks[index] = {
      ...tasks[index],
      title: data.title ?? tasks[index].title,
      description: data.description ?? tasks[index].description,
      priority: data.priority ?? tasks[index].priority,
      category: data.category ?? tasks[index].category,
      attachments: data.attachments ?? tasks[index].attachments,
    };
    io.emit("task:updated", tasks[index]);
    console.log(`Task updated: ${tasks[index].title} (${tasks[index].id})`);
  });

  // Move a task to a different column
  socket.on("task:move", (data) => {
    const index = tasks.findIndex((t) => t.id === data.id);
    if (index === -1) return;

    tasks[index].column = data.column;
    io.emit("task:moved", { id: data.id, column: data.column });
    console.log(`Task moved: ${tasks[index].title} → ${data.column}`);
  });

  // Delete a task
  socket.on("task:delete", (data) => {
    const id = typeof data === "string" ? data : data.id;
    tasks = tasks.filter((t) => t.id !== id);
    io.emit("task:deleted", { id });
    console.log(`Task deleted: ${id}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server, io };
