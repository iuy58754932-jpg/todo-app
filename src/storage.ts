import type { Task } from "./types";

const KEY = "todo-app.tasks.v1";
const SEQ_KEY = "todo-app.seq.v1";

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

export function nextId(): number {
  const cur = Number(localStorage.getItem(SEQ_KEY) ?? "0");
  const next = cur + 1;
  localStorage.setItem(SEQ_KEY, String(next));
  return next;
}
