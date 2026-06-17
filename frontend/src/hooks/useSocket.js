import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";

const isProd = import.meta.env.PROD;
const SOCKET_URL = isProd ? undefined : "http://localhost:5000";

const STORAGE_KEY = "kanban-tasks";

/** Load tasks from localStorage */
function loadLocalTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save tasks to localStorage */
function saveLocalTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore quota errors
  }
}

let localNextId = 1;
function generateLocalId() {
  return `task-local-${localNextId++}-${Date.now()}`;
}

/**
 * Custom hook that manages the Socket.IO connection and task state.
 * Falls back to localStorage when the WebSocket server is unavailable
 * (e.g. on Vercel where persistent WebSockets aren't supported).
 */
export function useSocket() {
  const [tasks, setTasks] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Timeout: if we don't connect within 3 seconds, switch to offline/local mode
    const fallbackTimer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          // Still loading — server never connected, go offline
          setOffline(true);
          setConnected(false);
          setTasks(loadLocalTasks());
          return false;
        }
        return prev;
      });
    }, 3000);

    const socket = io(SOCKET_URL, {
      path: isProd ? "/_/backend/socket.io" : "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 3000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      clearTimeout(fallbackTimer);
      setConnected(true);
      setOffline(false);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", () => {
      // If we've exhausted reconnection attempts, go offline
    });

    // Initial sync — receive all tasks on connection
    socket.on("sync:tasks", (allTasks) => {
      clearTimeout(fallbackTimer);
      setTasks(allTasks);
      setLoading(false);
      setOffline(false);
    });

    // A new task was created (by any client)
    socket.on("task:created", (task) => {
      setTasks((prev) => {
        if (prev.some((t) => t.id === task.id)) return prev;
        return [...prev, task];
      });
    });

    // A task was updated
    socket.on("task:updated", (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    });

    // A task was moved to a different column
    socket.on("task:moved", ({ id, column }) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, column } : t))
      );
    });

    // A task was deleted
    socket.on("task:deleted", ({ id }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });

    return () => {
      clearTimeout(fallbackTimer);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Persist tasks to localStorage whenever they change (for offline mode)
  useEffect(() => {
    if (offline) {
      saveLocalTasks(tasks);
    }
  }, [tasks, offline]);

  const createTask = useCallback(
    (data) => {
      if (offline) {
        const task = {
          id: generateLocalId(),
          title: data.title || "Untitled Task",
          description: data.description || "",
          column: data.column || "todo",
          priority: data.priority || "medium",
          category: data.category || "feature",
          attachments: data.attachments || [],
          createdAt: new Date().toISOString(),
        };
        setTasks((prev) => [...prev, task]);
      } else {
        socketRef.current?.emit("task:create", data);
      }
    },
    [offline]
  );

  const updateTask = useCallback(
    (data) => {
      if (offline) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === data.id
              ? {
                  ...t,
                  title: data.title ?? t.title,
                  description: data.description ?? t.description,
                  priority: data.priority ?? t.priority,
                  category: data.category ?? t.category,
                  attachments: data.attachments ?? t.attachments,
                }
              : t
          )
        );
      } else {
        socketRef.current?.emit("task:update", data);
      }
    },
    [offline]
  );

  const moveTask = useCallback(
    (id, column) => {
      if (offline) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, column } : t))
        );
      } else {
        socketRef.current?.emit("task:move", { id, column });
      }
    },
    [offline]
  );

  const deleteTask = useCallback(
    (id) => {
      if (offline) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        socketRef.current?.emit("task:delete", { id });
      }
    },
    [offline]
  );

  return {
    tasks,
    connected,
    loading,
    offline,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
  };
}
