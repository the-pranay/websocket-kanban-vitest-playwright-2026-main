import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import TaskCard from "../../components/TaskCard";

const mockTask = {
  id: "task-1",
  title: "Implement login",
  description: "Add OAuth2 login flow to the app",
  column: "todo",
  priority: "high",
  category: "feature",
  attachments: [
    { url: "http://localhost:5000/uploads/screenshot.png", name: "screenshot.png", size: 2048, type: "image/png" },
  ],
  createdAt: "2026-01-01T00:00:00Z",
};

describe("TaskCard", () => {
  const defaultProps = {
    task: mockTask,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  test("renders task title", () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText("Implement login")).toBeInTheDocument();
  });

  test("renders task description", () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText("Add OAuth2 login flow to the app")).toBeInTheDocument();
  });

  test("renders priority badge", () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  test("renders category badge", () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText("Feature")).toBeInTheDocument();
  });

  test("renders attachment indicator with count", () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText("📎 1")).toBeInTheDocument();
  });

  test("renders image attachment thumbnail", () => {
    render(<TaskCard {...defaultProps} />);
    const img = screen.getByAltText("screenshot.png");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "http://localhost:5000/uploads/screenshot.png");
  });

  test("edit button calls onEdit with task", () => {
    render(<TaskCard {...defaultProps} />);
    const editBtn = screen.getByTestId("edit-task-task-1");
    fireEvent.click(editBtn);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTask);
  });

  test("delete button calls onDelete with task id", () => {
    render(<TaskCard {...defaultProps} />);
    const deleteBtn = screen.getByTestId("delete-task-task-1");
    fireEvent.click(deleteBtn);
    expect(defaultProps.onDelete).toHaveBeenCalledWith("task-1");
  });

  test("card is draggable", () => {
    render(<TaskCard {...defaultProps} />);
    const card = screen.getByTestId("task-card-task-1");
    expect(card).toHaveAttribute("draggable", "true");
  });

  test("drag start sets data transfer", () => {
    render(<TaskCard {...defaultProps} />);
    const card = screen.getByTestId("task-card-task-1");
    const setData = vi.fn();
    fireEvent.dragStart(card, {
      dataTransfer: { setData, effectAllowed: "" },
    });
    expect(setData).toHaveBeenCalledWith("text/plain", "task-1");
  });

  test("renders without description when not provided", () => {
    const taskNoDesc = { ...mockTask, description: "" };
    render(<TaskCard {...defaultProps} task={taskNoDesc} />);
    expect(screen.queryByText("Add OAuth2 login flow to the app")).not.toBeInTheDocument();
  });

  test("renders without attachments when empty", () => {
    const taskNoAtt = { ...mockTask, attachments: [] };
    render(<TaskCard {...defaultProps} task={taskNoAtt} />);
    expect(screen.queryByText(/📎/)).not.toBeInTheDocument();
  });
});
