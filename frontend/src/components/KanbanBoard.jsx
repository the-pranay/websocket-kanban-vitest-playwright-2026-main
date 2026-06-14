import React, { useState, useCallback } from "react";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

const COLUMNS = [
  { id: "todo", label: "To Do", dotClass: "todo" },
  { id: "inprogress", label: "In Progress", dotClass: "inprogress" },
  { id: "done", label: "Done", dotClass: "done" },
];

/**
 * Main Kanban board component.
 * Renders three columns with drag-and-drop support and a task modal for CRUD.
 *
 * Props:
 *  - tasks: array of task objects
 *  - onCreateTask: (data) => void
 *  - onUpdateTask: (data) => void
 *  - onMoveTask: (id, column) => void
 *  - onDeleteTask: (id) => void
 */
function KanbanBoard({ tasks, onCreateTask, onUpdateTask, onMoveTask, onDeleteTask }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleSave = (data) => {
    if (data.id) {
      onUpdateTask(data);
    } else {
      onCreateTask({ ...data, column: "todo" });
    }
    closeModal();
  };

  const handleDelete = useCallback(
    (id) => {
      onDeleteTask(id);
    },
    [onDeleteTask]
  );

  // --- Drag & Drop handlers ---
  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e) => {
    // Only clear if we're truly leaving the column
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onMoveTask(taskId, columnId);
    }
    setDragOverColumn(null);
  };

  const getTasksForColumn = (columnId) =>
    (tasks || []).filter((t) => t.column === columnId);

  return (
    <div>
      {/* Toolbar */}
      <div className="board-toolbar">
        <h2 style={{ fontSize: "var(--font-lg)", fontWeight: 700 }}>
          Kanban Board
        </h2>
        <button
          className="btn btn-primary"
          onClick={openCreateModal}
          data-testid="add-task-btn"
        >
          + Add Task
        </button>
      </div>

      {/* Board */}
      <div className="kanban-board" data-testid="kanban-board">
        {COLUMNS.map((col) => {
          const columnTasks = getTasksForColumn(col.id);
          return (
            <div
              key={col.id}
              className={`kanban-column ${dragOverColumn === col.id ? "drag-over" : ""}`}
              data-testid={`column-${col.id}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="column-header">
                <span className="column-title">
                  <span className={`column-dot ${col.dotClass}`} />
                  {col.label}
                </span>
                <span className="column-count" data-testid={`column-count-${col.id}`}>
                  {columnTasks.length}
                </span>
              </div>

              <div className="column-tasks">
                {columnTasks.length === 0 ? (
                  <div className="column-empty">Drop tasks here</div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default KanbanBoard;
