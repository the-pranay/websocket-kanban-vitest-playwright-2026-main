import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Create mock objects using vi.hoisted so they're available during vi.mock hoisting
const { mockSocket, mockIo } = vi.hoisted(() => {
  const mockSocket = {
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  };
  const mockIo = vi.fn(() => mockSocket);
  return { mockSocket, mockIo };
});

vi.mock("socket.io-client", () => ({
  io: mockIo,
}));

// Import after mocking
import { useSocket } from "../../hooks/useSocket";

describe("useSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIo.mockReturnValue(mockSocket);
  });

  test("connects to server on mount", () => {
    renderHook(() => useSocket());
    expect(mockIo).toHaveBeenCalledWith("http://localhost:5000", expect.any(Object));
  });

  test("registers event listeners on mount", () => {
    renderHook(() => useSocket());
    const registeredEvents = mockSocket.on.mock.calls.map((call) => call[0]);
    expect(registeredEvents).toContain("connect");
    expect(registeredEvents).toContain("disconnect");
    expect(registeredEvents).toContain("sync:tasks");
    expect(registeredEvents).toContain("task:created");
    expect(registeredEvents).toContain("task:updated");
    expect(registeredEvents).toContain("task:moved");
    expect(registeredEvents).toContain("task:deleted");
  });

  test("handles sync:tasks event", () => {
    renderHook(() => useSocket());
    const syncHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "sync:tasks"
    )[1];

    const tasks = [
      { id: "1", title: "Test", column: "todo", priority: "low", category: "feature", attachments: [] },
    ];
    act(() => syncHandler(tasks));
    // Verified that the handler runs without error
  });

  test("sets connected to true on connect event", () => {
    const { result } = renderHook(() => useSocket());
    const connectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "connect"
    )[1];
    act(() => connectHandler());
    expect(result.current.connected).toBe(true);
  });

  test("sets connected to false on disconnect event", () => {
    const { result } = renderHook(() => useSocket());
    // First connect
    const connectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "connect"
    )[1];
    act(() => connectHandler());
    // Then disconnect
    const disconnectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "disconnect"
    )[1];
    act(() => disconnectHandler());
    expect(result.current.connected).toBe(false);
  });

  test("emits task:create when createTask is called", () => {
    const { result } = renderHook(() => useSocket());
    const data = { title: "New Task", column: "todo" };
    act(() => result.current.createTask(data));
    expect(mockSocket.emit).toHaveBeenCalledWith("task:create", data);
  });

  test("emits task:update when updateTask is called", () => {
    const { result } = renderHook(() => useSocket());
    const data = { id: "task-1", title: "Updated" };
    act(() => result.current.updateTask(data));
    expect(mockSocket.emit).toHaveBeenCalledWith("task:update", data);
  });

  test("emits task:move when moveTask is called", () => {
    const { result } = renderHook(() => useSocket());
    act(() => result.current.moveTask("task-1", "done"));
    expect(mockSocket.emit).toHaveBeenCalledWith("task:move", {
      id: "task-1",
      column: "done",
    });
  });

  test("emits task:delete when deleteTask is called", () => {
    const { result } = renderHook(() => useSocket());
    act(() => result.current.deleteTask("task-1"));
    expect(mockSocket.emit).toHaveBeenCalledWith("task:delete", {
      id: "task-1",
    });
  });

  test("disconnects on unmount", () => {
    const { unmount } = renderHook(() => useSocket());
    unmount();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  test("updates tasks on task:created event", () => {
    const { result } = renderHook(() => useSocket());
    const createdHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "task:created"
    )[1];

    const newTask = { id: "task-new", title: "New", column: "todo", priority: "low", category: "feature", attachments: [] };
    act(() => createdHandler(newTask));
    expect(result.current.tasks).toContainEqual(newTask);
  });

  test("sets loading to false after sync:tasks", () => {
    const { result } = renderHook(() => useSocket());
    expect(result.current.loading).toBe(true);

    const syncHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "sync:tasks"
    )[1];
    act(() => syncHandler([]));
    expect(result.current.loading).toBe(false);
  });
});
