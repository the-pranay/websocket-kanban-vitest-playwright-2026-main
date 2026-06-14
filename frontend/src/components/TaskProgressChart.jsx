import React from "react";

/**
 * Displays a task progress visualization with:
 * - Horizontal bar chart showing task distribution per column
 * - A completion ring (SVG donut chart)
 * - Summary stats for each column
 */
function TaskProgressChart({ tasks }) {
  const todoCount = tasks.filter((t) => t.column === "todo").length;
  const inProgressCount = tasks.filter((t) => t.column === "inprogress").length;
  const doneCount = tasks.filter((t) => t.column === "done").length;
  const total = tasks.length;

  const todoPercent = total > 0 ? Math.round((todoCount / total) * 100) : 0;
  const inProgressPercent = total > 0 ? Math.round((inProgressCount / total) * 100) : 0;
  const donePercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  // SVG ring calculations
  const ringRadius = 40;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const completionOffset = ringCircumference - (donePercent / 100) * ringCircumference;

  return (
    <div className="chart-container" data-testid="task-progress-chart">
      <h3 className="chart-title">Task Progress</h3>

      {total === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "var(--font-sm)", textAlign: "center", padding: "var(--space-lg) 0" }}>
          No tasks yet. Create one to see progress.
        </p>
      ) : (
        <>
          <div className="chart-bar-container">
            <div className="chart-bar-row">
              <div className="chart-bar-label">
                <span>To Do</span>
                <span className="chart-bar-count" data-testid="todo-count">{todoCount}</span>
              </div>
              <div className="chart-bar-track">
                <div
                  className="chart-bar-fill todo"
                  style={{ width: `${todoPercent}%` }}
                  data-testid="todo-bar"
                >
                  {todoPercent > 10 ? `${todoPercent}%` : ""}
                </div>
              </div>
            </div>

            <div className="chart-bar-row">
              <div className="chart-bar-label">
                <span>In Progress</span>
                <span className="chart-bar-count" data-testid="inprogress-count">{inProgressCount}</span>
              </div>
              <div className="chart-bar-track">
                <div
                  className="chart-bar-fill inprogress"
                  style={{ width: `${inProgressPercent}%` }}
                  data-testid="inprogress-bar"
                >
                  {inProgressPercent > 10 ? `${inProgressPercent}%` : ""}
                </div>
              </div>
            </div>

            <div className="chart-bar-row">
              <div className="chart-bar-label">
                <span>Done</span>
                <span className="chart-bar-count" data-testid="done-count">{doneCount}</span>
              </div>
              <div className="chart-bar-track">
                <div
                  className="chart-bar-fill done"
                  style={{ width: `${donePercent}%` }}
                  data-testid="done-bar"
                >
                  {donePercent > 10 ? `${donePercent}%` : ""}
                </div>
              </div>
            </div>
          </div>

          <div className="completion-ring-container">
            <div className="completion-ring">
              <svg width="96" height="96" viewBox="0 0 100 100">
                <circle
                  className="completion-ring-bg"
                  cx="50"
                  cy="50"
                  r={ringRadius}
                />
                <circle
                  className="completion-ring-fill"
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={completionOffset}
                />
              </svg>
              <div className="completion-ring-text">
                <span className="completion-percentage" data-testid="completion-percentage">
                  {donePercent}%
                </span>
                <span className="completion-label">Done</span>
              </div>
            </div>
          </div>

          <div className="chart-summary">
            <div className="chart-stat">
              <div className="chart-stat-value todo" data-testid="stat-todo">{todoCount}</div>
              <div className="chart-stat-label">To Do</div>
            </div>
            <div className="chart-stat">
              <div className="chart-stat-value inprogress" data-testid="stat-inprogress">{inProgressCount}</div>
              <div className="chart-stat-label">In Progress</div>
            </div>
            <div className="chart-stat">
              <div className="chart-stat-value done" data-testid="stat-done">{doneCount}</div>
              <div className="chart-stat-label">Done</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TaskProgressChart;
