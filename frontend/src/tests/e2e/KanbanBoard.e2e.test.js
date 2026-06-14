import { test, expect } from "@playwright/test";

test("User can add a task and see it on the board", async ({ page }) => {
  await page.goto("http://localhost:3000");

  // Wait for the board to be visible
  await expect(page.locator("[data-testid='kanban-board']")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Kanban Board")).toBeVisible();

  // Create a new task
  await page.locator("[data-testid='add-task-btn']").click();
  await page.locator("[data-testid='task-title-input']").fill("My First Task");
  await page.locator("[data-testid='modal-save-btn']").click();

  // Verify task appears
  await expect(page.locator("[data-testid='column-todo']")).toContainText("My First Task");
});
