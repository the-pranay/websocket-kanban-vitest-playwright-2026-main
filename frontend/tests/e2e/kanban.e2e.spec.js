import { test, expect } from "@playwright/test";

test.describe("Kanban Board E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    // Wait for the app to load (loading overlay disappears or board appears)
    await expect(page.locator("[data-testid='kanban-board']")).toBeVisible({ timeout: 10000 });
  });

  test("page loads with correct title and header", async ({ page }) => {
    await expect(page.getByText("Kanban Board")).toBeVisible();
    await expect(page.locator("[data-testid='connection-status']")).toBeVisible();
  });

  test("displays three columns: To Do, In Progress, Done", async ({ page }) => {
    await expect(page.locator("[data-testid='column-todo']")).toBeVisible();
    await expect(page.locator("[data-testid='column-inprogress']")).toBeVisible();
    await expect(page.locator("[data-testid='column-done']")).toBeVisible();
  });

  test("user can create a task", async ({ page }) => {
    // Click Add Task button
    await page.locator("[data-testid='add-task-btn']").click();

    // Fill in the form
    await page.locator("[data-testid='task-title-input']").fill("E2E Test Task");
    await page.locator("[data-testid='task-description-input']").fill("Created by Playwright");
    await page.locator("[data-testid='task-priority-select']").selectOption("high");
    await page.locator("[data-testid='task-category-select']").selectOption("bug");

    // Submit
    await page.locator("[data-testid='modal-save-btn']").click();

    // Task should appear in To Do column
    await expect(page.locator("[data-testid='column-todo']")).toContainText("E2E Test Task");
  });

  test("user cannot create a task without a title", async ({ page }) => {
    await page.locator("[data-testid='add-task-btn']").click();

    // Leave title empty, click save
    await page.locator("[data-testid='modal-save-btn']").click();

    // Error should show
    await expect(page.locator("[data-testid='title-error']")).toBeVisible();
    await expect(page.locator("[data-testid='title-error']")).toContainText("Title is required");
  });

  test("user can delete a task", async ({ page }) => {
    // First create a task
    await page.locator("[data-testid='add-task-btn']").click();
    await page.locator("[data-testid='task-title-input']").fill("Task to Delete");
    await page.locator("[data-testid='modal-save-btn']").click();

    // Wait for task to appear
    await expect(page.locator("text=Task to Delete")).toBeVisible();

    // Find and click the delete button (hover first to make it visible)
    const taskCard = page.locator(".task-card", { hasText: "Task to Delete" });
    await taskCard.hover();
    await taskCard.locator(".task-action-btn.delete").click();

    // Task should be removed
    await expect(page.locator("text=Task to Delete")).not.toBeVisible();
  });

  test("user can select a priority level", async ({ page }) => {
    await page.locator("[data-testid='add-task-btn']").click();
    await page.locator("[data-testid='task-title-input']").fill("Priority Test");

    // Select high priority
    await page.locator("[data-testid='task-priority-select']").selectOption("high");

    // Verify the select has the right value
    await expect(page.locator("[data-testid='task-priority-select']")).toHaveValue("high");

    await page.locator("[data-testid='modal-save-btn']").click();

    // Verify high priority badge is shown
    const todoColumn = page.locator("[data-testid='column-todo']");
    await expect(todoColumn.locator(".badge-priority-high")).toBeVisible();
  });

  test("user can change the task category and verify the update", async ({ page }) => {
    // Create a task with "Feature" category
    await page.locator("[data-testid='add-task-btn']").click();
    await page.locator("[data-testid='task-title-input']").fill("Category Test");
    await page.locator("[data-testid='task-category-select']").selectOption("feature");
    await page.locator("[data-testid='modal-save-btn']").click();

    // Verify Feature badge
    const taskCard = page.locator(".task-card", { hasText: "Category Test" });
    await expect(taskCard.locator(".badge-category-feature")).toBeVisible();

    // Edit the task and change category to Bug
    await taskCard.hover();
    await taskCard.locator(".task-action-btn.edit").click();
    await page.locator("[data-testid='task-category-select']").selectOption("bug");
    await page.locator("[data-testid='modal-save-btn']").click();

    // Verify Bug badge is now shown
    const updatedCard = page.locator(".task-card", { hasText: "Category Test" });
    await expect(updatedCard.locator(".badge-category-bug")).toBeVisible();
  });

  test("task progress chart updates when tasks are created", async ({ page }) => {
    // Initially the chart should show no tasks message
    const chart = page.locator("[data-testid='task-progress-chart']");
    await expect(chart).toBeVisible();

    // Create a task
    await page.locator("[data-testid='add-task-btn']").click();
    await page.locator("[data-testid='task-title-input']").fill("Chart Test Task");
    await page.locator("[data-testid='modal-save-btn']").click();

    // Chart should now show the task count
    await expect(page.locator("[data-testid='todo-count']")).toContainText("1");
    await expect(page.locator("[data-testid='stat-todo']")).toContainText("1");
  });

  test("drag and drop moves a task between columns", async ({ page }) => {
    // Create a task
    await page.locator("[data-testid='add-task-btn']").click();
    await page.locator("[data-testid='task-title-input']").fill("Drag Test Task");
    await page.locator("[data-testid='modal-save-btn']").click();

    // Wait for task to appear in To Do
    const taskCard = page.locator(".task-card", { hasText: "Drag Test Task" });
    await expect(taskCard).toBeVisible();

    // Drag to Done column
    const doneColumn = page.locator("[data-testid='column-done']");
    await taskCard.dragTo(doneColumn);

    // Verify task moved to Done
    await expect(doneColumn).toContainText("Drag Test Task");
  });

  test("modal can be closed by cancel button", async ({ page }) => {
    await page.locator("[data-testid='add-task-btn']").click();
    await expect(page.locator("[data-testid='task-modal']")).toBeVisible();

    await page.locator("[data-testid='modal-cancel-btn']").click();
    await expect(page.locator("[data-testid='task-modal']")).not.toBeVisible();
  });

  test("connection status indicator is visible", async ({ page }) => {
    const status = page.locator("[data-testid='connection-status']");
    await expect(status).toBeVisible();
    // Should show "Connected" when backend is running
    await expect(status).toContainText("Connected");
  });
});
