import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

/**
 * Custom hook that manages the Socket.IO connection and task state.
 * Provides real-time sync for all CRUD operations on tasks.
 */
export function useSocket() {
  const [tasks, setTasks] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // Initial sync — receive all tasks on connection
    socket.on("sync:tasks", (allTasks) => {
      setTasks(allTasks);
      setLoading(false);
    });

    // A new task was created (by any client)
    socket.on("task:created", (task) => {
      setTasks((prev) => {
        // Avoid duplicates
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
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const createTask = useCallback((data) => {
    socketRef.current?.emit("task:create", data);
  }, []);

  const updateTask = useCallback((data) => {
    socketRef.current?.emit("task:update", data);
  }, []);

  const moveTask = useCallback((id, column) => {
    socketRef.current?.emit("task:move", { id, column });
  }, []);

  const deleteTask = useCallback((id) => {
    socketRef.current?.emit("task:delete", { id });
  }, []);

  return {
    tasks,
    connected,
    loading,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
  };
}
