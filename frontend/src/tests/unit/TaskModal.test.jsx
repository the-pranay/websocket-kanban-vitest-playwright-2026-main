import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import TaskModal from "../../components/TaskModal";

describe("TaskModal", () => {
  const defaultProps = {
    task: null,
    onSave: vi.fn(),
    onClose: vi.fn(),
  };

  test("renders Create New Task title when no task is provided", () => {
    render(<TaskModal {...defaultProps} />);
    expect(screen.getByText("Create New Task")).toBeInTheDocument();
  });

  test("renders Edit Task title when task is provided", () => {
    const task = {
      id: "task-1",
      title: "Existing Task",
      description: "A description",
      priority: "high",
      category: "bug",
      attachments: [],
    };
    render(<TaskModal {...defaultProps} task={task} />);
    expect(screen.getByText("Edit Task")).toBeInTheDocument();
  });

  test("renders all form fields", () => {
    render(<TaskModal {...defaultProps} />);
    expect(screen.getByTestId("task-title-input")).toBeInTheDocument();
    expect(screen.getByTestId("task-description-input")).toBeInTheDocument();
    expect(screen.getByTestId("task-priority-select")).toBeInTheDocument();
    expect(screen.getByTestId("task-category-select")).toBeInTheDocument();
    expect(screen.getByTestId("file-upload-input")).toBeInTheDocument();
  });

  test("pre-fills form when editing an existing task", () => {
    const task = {
      id: "task-1",
      title: "Bug Fix",
      description: "Fix the login issue",
      priority: "high",
      category: "bug",
      attachments: [],
    };
    render(<TaskModal {...defaultProps} task={task} />);
    expect(screen.getByTestId("task-title-input")).toHaveValue("Bug Fix");
    expect(screen.getByTestId("task-description-input")).toHaveValue("Fix the login issue");
    expect(screen.getByTestId("task-priority-select")).toHaveValue("high");
    expect(screen.getByTestId("task-category-select")).toHaveValue("bug");
  });

  test("shows title error when submitting without title", () => {
    render(<TaskModal {...defaultProps} />);
    const saveBtn = screen.getByTestId("modal-save-btn");
    fireEvent.click(saveBtn);
    expect(screen.getByTestId("title-error")).toHaveTextContent("Title is required");
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  test("calls onSave with correct data for new task", () => {
    const onSave = vi.fn();
    render(<TaskModal {...defaultProps} onSave={onSave} />);

    fireEvent.change(screen.getByTestId("task-title-input"), {
      target: { value: "New Task" },
    });
    fireEvent.change(screen.getByTestId("task-description-input"), {
      target: { value: "Task description" },
    });
    fireEvent.change(screen.getByTestId("task-priority-select"), {
      target: { value: "high" },
    });
    fireEvent.change(screen.getByTestId("task-category-select"), {
      target: { value: "bug" },
    });

    fireEvent.click(screen.getByTestId("modal-save-btn"));

    expect(onSave).toHaveBeenCalledWith({
      title: "New Task",
      description: "Task description",
      priority: "high",
      category: "bug",
      attachments: [],
    });
  });

  test("calls onSave with id when editing", () => {
    const onSave = vi.fn();
    const task = {
      id: "task-42",
      title: "Old Title",
      description: "",
      priority: "low",
      category: "feature",
      attachments: [],
    };
    render(<TaskModal {...defaultProps} task={task} onSave={onSave} />);

    fireEvent.change(screen.getByTestId("task-title-input"), {
      target: { value: "Updated Title" },
    });
    fireEvent.click(screen.getByTestId("modal-save-btn"));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "task-42",
        title: "Updated Title",
      })
    );
  });

  test("cancel button calls onClose", () => {
    render(<TaskModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("modal-cancel-btn"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test("close button calls onClose", () => {
    render(<TaskModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("modal-close-btn"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test("clicking overlay calls onClose", () => {
    const onClose = vi.fn();
    render(<TaskModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("task-modal-overlay"));
    expect(onClose).toHaveBeenCalled();
  });

  test("priority dropdown has three options", () => {
    render(<TaskModal {...defaultProps} />);
    const select = screen.getByTestId("task-priority-select");
    expect(select.options).toHaveLength(3);
  });

  test("category dropdown has three options", () => {
    render(<TaskModal {...defaultProps} />);
    const select = screen.getByTestId("task-category-select");
    expect(select.options).toHaveLength(3);
  });
});
