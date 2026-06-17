import React from "react";
import KanbanBoard from "./components/KanbanBoard";
import TaskProgressChart from "./components/TaskProgressChart";
import { useSocket } from "./hooks/useSocket";

function App() {
  const {
    tasks,
    connected,
    loading,
    offline,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
  } = useSocket();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kanban Board</h1>
        <div className="header-actions">
          <div className="connection-status" data-testid="connection-status">
            <span
              className={`status-dot ${connected ? "connected" : offline ? "offline" : ""}`}
              data-testid="status-dot"
            />
            {connected
              ? "Connected"
              : offline
                ? "Offline Mode"
                : "Reconnecting..."}
          </div>
        </div>
      </header>

      {loading && (
        <div className="loading-overlay" data-testid="loading-overlay">
          <div style={{ textAlign: "center" }}>
            <div className="loading-spinner" />
            <div className="loading-text">Connecting to server...</div>
          </div>
        </div>
      )}

      <main className="app-content">
        <KanbanBoard
          tasks={tasks}
          onCreateTask={createTask}
          onUpdateTask={updateTask}
          onMoveTask={moveTask}
          onDeleteTask={deleteTask}
        />
        <TaskProgressChart tasks={tasks} />
      </main>
    </div>
  );
}

export default App;
