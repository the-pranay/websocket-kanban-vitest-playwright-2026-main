import React from "react";

const PRIORITY_LABELS = { low: "Low", medium: "Medium", high: "High" };
const CATEGORY_LABELS = { bug: "Bug", feature: "Feature", enhancement: "Enhancement" };

/**
 * Renders an individual task card with drag support, priority/category badges,
 * attachment indicators, and edit/delete actions.
 */
function TaskCard({ task, onEdit, onDelete }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
  };

  const isImage = (type) => type && type.startsWith("image/");

  return (
    <div
      className="task-card"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-testid={`task-card-${task.id}`}
    >
      <div className="task-card-header">
        <span className="task-title">{task.title}</span>
        <div className="task-actions">
          <button
            className="task-action-btn edit"
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label="Edit task"
            data-testid={`edit-task-${task.id}`}
          >
            ✎
          </button>
          <button
            className="task-action-btn delete"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            aria-label="Delete task"
            data-testid={`delete-task-${task.id}`}
          >
            ×
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span className={`badge badge-priority-${task.priority}`}>
          {PRIORITY_LABELS[task.priority] || task.priority}
        </span>
        <span className={`badge badge-category-${task.category}`}>
          {CATEGORY_LABELS[task.category] || task.category}
        </span>
        {task.attachments && task.attachments.length > 0 && (
          <span className="task-attachment-indicator">
            📎 {task.attachments.length}
          </span>
        )}
      </div>

      {task.attachments && task.attachments.length > 0 && (
        <div className="task-attachments">
          {task.attachments.map((att, idx) =>
            isImage(att.type) ? (
              <img
                key={idx}
                src={att.url}
                alt={att.name}
                className="task-attachment-thumb"
              />
            ) : (
              <div key={idx} className="task-attachment-file" title={att.name}>
                doc
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default TaskCard;
