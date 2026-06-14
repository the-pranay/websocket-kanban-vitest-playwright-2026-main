import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";

/**
 * Integration tests that verify multi-component interactions:
 * creating, moving, deleting tasks, and updating priority/category.
 */
describe("KanbanBoard Integration", () => {
  const createMockTasks = () => [
    {
      id: "task-1",
      title: "Setup CI pipeline",
      description: "Configure GitHub Actions",
      column: "todo",
      priority: "medium",
      category: "feature",
      attachments: [],
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "task-2",
      title: "Write tests",
      description: "Add unit and integration tests",
      column: "inprogress",
      priority: "high",
      category: "enhancement",
      attachments: [],
      createdAt: "2026-01-02T00:00:00Z",
    },
    {
      id: "task-3",
      title: "Deploy v1",
      description: "Deploy to production",
      column: "done",
      priority: "low",
      category: "feature",
      attachments: [],
      createdAt: "2026-01-03T00:00:00Z",
    },
  ];

  test("creating a task updates the board via onCreateTask", () => {
    const onCreateTask = vi.fn();
    const tasks = createMockTasks();
    render(
      <KanbanBoard
        tasks={tasks}
        onCreateTask={onCreateTask}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    // Open create modal
    fireEvent.click(screen.getByTestId("add-task-btn"));
    expect(screen.getByTestId("task-modal")).toBeInTheDocument();

    // Fill in title
    fireEvent.change(screen.getByTestId("task-title-input"), {
      target: { value: "New Feature" },
    });

    // Submit
    fireEvent.click(screen.getByTestId("modal-save-btn"));

    expect(onCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Feature",
        column: "todo",
      })
    );
  });

  test("editing a task calls onUpdateTask with updated data", () => {
    const onUpdateTask = vi.fn();
    const tasks = createMockTasks();
    render(
      <KanbanBoard
        tasks={tasks}
        onCreateTask={vi.fn()}
        onUpdateTask={onUpdateTask}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    // Click edit on task-1
    fireEvent.click(screen.getByTestId("edit-task-task-1"));

    // Change the title
    fireEvent.change(screen.getByTestId("task-title-input"), {
      target: { value: "Updated Pipeline" },
    });

    // Change priority to high
    fireEvent.change(screen.getByTestId("task-priority-select"), {
      target: { value: "high" },
    });

    // Change category to bug
    fireEvent.change(screen.getByTestId("task-category-select"), {
      target: { value: "bug" },
    });

    // Save
    fireEvent.click(screen.getByTestId("modal-save-btn"));

    expect(onUpdateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "task-1",
        title: "Updated Pipeline",
        priority: "high",
        category: "bug",
      })
    );
  });

  test("deleting a task calls onDeleteTask", () => {
    const onDeleteTask = vi.fn();
    const tasks = createMockTasks();
    render(
      <KanbanBoard
        tasks={tasks}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={onDeleteTask}
      />
    );

    fireEvent.click(screen.getByTestId("delete-task-task-2"));
    expect(onDeleteTask).toHaveBeenCalledWith("task-2");
  });

  test("drag and drop moves a task to another column", () => {
    const onMoveTask = vi.fn();
    const tasks = createMockTasks();
    render(
      <KanbanBoard
        tasks={tasks}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={onMoveTask}
        onDeleteTask={vi.fn()}
      />
    );

    const taskCard = screen.getByTestId("task-card-task-1");
    const doneColumn = screen.getByTestId("column-done");

    // Simulate drag start
    fireEvent.dragStart(taskCard, {
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: "",
      },
    });

    // Simulate drag over and drop on done column
    fireEvent.dragOver(doneColumn, {
      dataTransfer: { dropEffect: "" },
    });

    fireEvent.drop(doneColumn, {
      dataTransfer: {
        getData: () => "task-1",
      },
    });

    expect(onMoveTask).toHaveBeenCalledWith("task-1", "done");
  });

  test("priority change via edit modal reflects correct value", () => {
    const onUpdateTask = vi.fn();
    const tasks = createMockTasks();
    render(
      <KanbanBoard
        tasks={tasks}
        onCreateTask={vi.fn()}
        onUpdateTask={onUpdateTask}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    // Edit task-3 (currently low priority)
    fireEvent.click(screen.getByTestId("edit-task-task-3"));
    const prioritySelect = screen.getByTestId("task-priority-select");
    expect(prioritySelect.value).toBe("low");

    // Change to high
    fireEvent.change(prioritySelect, { target: { value: "high" } });
    fireEvent.click(screen.getByTestId("modal-save-btn"));

    expect(onUpdateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "task-3",
        priority: "high",
      })
    );
  });

  test("category change via edit modal reflects correct value", () => {
    const onUpdateTask = vi.fn();
    const tasks = createMockTasks();
    render(
      <KanbanBoard
        tasks={tasks}
        onCreateTask={vi.fn()}
        onUpdateTask={onUpdateTask}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    // Edit task-1 (currently feature)
    fireEvent.click(screen.getByTestId("edit-task-task-1"));
    const categorySelect = screen.getByTestId("task-category-select");
    expect(categorySelect.value).toBe("feature");

    // Change to enhancement
    fireEvent.change(categorySelect, { target: { value: "enhancement" } });
    fireEvent.click(screen.getByTestId("modal-save-btn"));

    expect(onUpdateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "task-1",
        category: "enhancement",
      })
    );
  });

  test("modal closes after creating a task", () => {
    render(
      <KanbanBoard
        tasks={[]}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("add-task-btn"));
    expect(screen.getByTestId("task-modal")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("task-title-input"), {
      target: { value: "Quick Task" },
    });
    fireEvent.click(screen.getByTestId("modal-save-btn"));

    expect(screen.queryByTestId("task-modal")).not.toBeInTheDocument();
  });

  test("tasks render correctly across all three columns simultaneously", () => {
    const tasks = [
      ...createMockTasks(),
      {
        id: "task-4",
        title: "Extra todo",
        description: "",
        column: "todo",
        priority: "low",
        category: "bug",
        attachments: [],
        createdAt: "2026-01-04T00:00:00Z",
      },
    ];

    render(
      <KanbanBoard
        tasks={tasks}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    expect(screen.getByTestId("column-count-todo")).toHaveTextContent("2");
    expect(screen.getByTestId("column-count-inprogress")).toHaveTextContent("1");
    expect(screen.getByTestId("column-count-done")).toHaveTextContent("1");
  });
});
