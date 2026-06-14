import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";

const mockTasks = [
  {
    id: "task-1",
    title: "Design homepage",
    description: "Create mockups for the landing page",
    column: "todo",
    priority: "high",
    category: "feature",
    attachments: [],
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "task-2",
    title: "Fix login bug",
    description: "Users can't log in with SSO",
    column: "inprogress",
    priority: "high",
    category: "bug",
    attachments: [{ url: "http://localhost:5000/uploads/test.png", name: "test.png", size: 1024, type: "image/png" }],
    createdAt: "2026-01-02T00:00:00Z",
  },
  {
    id: "task-3",
    title: "Update docs",
    description: "Refresh API documentation",
    column: "done",
    priority: "low",
    category: "enhancement",
    attachments: [],
    createdAt: "2026-01-03T00:00:00Z",
  },
];

describe("KanbanBoard", () => {
  const defaultProps = {
    tasks: mockTasks,
    onCreateTask: vi.fn(),
    onUpdateTask: vi.fn(),
    onMoveTask: vi.fn(),
    onDeleteTask: vi.fn(),
  };

  test("renders Kanban Board title", () => {
    render(<KanbanBoard {...defaultProps} />);
    expect(screen.getByText("Kanban Board")).toBeInTheDocument();
  });

  test("renders three columns: To Do, In Progress, Done", () => {
    render(<KanbanBoard {...defaultProps} />);
    expect(screen.getByTestId("column-todo")).toBeInTheDocument();
    expect(screen.getByTestId("column-inprogress")).toBeInTheDocument();
    expect(screen.getByTestId("column-done")).toBeInTheDocument();
  });

  test("renders tasks in correct columns", () => {
    render(<KanbanBoard {...defaultProps} />);

    const todoColumn = screen.getByTestId("column-todo");
    const inprogressColumn = screen.getByTestId("column-inprogress");
    const doneColumn = screen.getByTestId("column-done");

    expect(todoColumn).toHaveTextContent("Design homepage");
    expect(inprogressColumn).toHaveTextContent("Fix login bug");
    expect(doneColumn).toHaveTextContent("Update docs");
  });

  test("shows correct task count per column", () => {
    render(<KanbanBoard {...defaultProps} />);
    expect(screen.getByTestId("column-count-todo")).toHaveTextContent("1");
    expect(screen.getByTestId("column-count-inprogress")).toHaveTextContent("1");
    expect(screen.getByTestId("column-count-done")).toHaveTextContent("1");
  });

  test("renders empty state when no tasks exist", () => {
    render(<KanbanBoard {...defaultProps} tasks={[]} />);
    const emptyMessages = screen.getAllByText("Drop tasks here");
    expect(emptyMessages).toHaveLength(3);
  });

  test("Add Task button opens the modal", () => {
    render(<KanbanBoard {...defaultProps} />);
    const addBtn = screen.getByTestId("add-task-btn");
    fireEvent.click(addBtn);
    expect(screen.getByTestId("task-modal")).toBeInTheDocument();
    expect(screen.getByText("Create New Task")).toBeInTheDocument();
  });

  test("clicking edit on a task opens modal in edit mode", () => {
    render(<KanbanBoard {...defaultProps} />);
    const editBtn = screen.getByTestId("edit-task-task-1");
    fireEvent.click(editBtn);
    expect(screen.getByTestId("task-modal")).toBeInTheDocument();
    expect(screen.getByText("Edit Task")).toBeInTheDocument();
  });

  test("clicking delete calls onDeleteTask", () => {
    render(<KanbanBoard {...defaultProps} />);
    const deleteBtn = screen.getByTestId("delete-task-task-1");
    fireEvent.click(deleteBtn);
    expect(defaultProps.onDeleteTask).toHaveBeenCalledWith("task-1");
  });

  test("priority badges render correctly", () => {
    render(<KanbanBoard {...defaultProps} />);
    expect(screen.getAllByText("High")).toHaveLength(2);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  test("category badges render correctly", () => {
    render(<KanbanBoard {...defaultProps} />);
    expect(screen.getByText("Feature")).toBeInTheDocument();
    expect(screen.getByText("Bug")).toBeInTheDocument();
    expect(screen.getByText("Enhancement")).toBeInTheDocument();
  });

  test("attachment indicator shows count", () => {
    render(<KanbanBoard {...defaultProps} />);
    expect(screen.getByText("📎 1")).toBeInTheDocument();
  });
});
