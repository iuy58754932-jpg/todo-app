import type { Subtask, Task } from "./types";

const KEY = "todo-app.tasks.v1";
const SEQ_KEY = "todo-app.seq.v1";

function migrate(raw: unknown): Task[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((t) => {
    const subtasks: Subtask[] = Array.isArray(t.subtasks)
      ? t.subtasks.filter(
          (s: unknown): s is Subtask =>
            !!s &&
            typeof s === "object" &&
            typeof (s as Subtask).id === "number" &&
            typeof (s as Subtask).title === "string" &&
            typeof (s as Subtask).done === "boolean",
        )
      : [];
    const tags: string[] = Array.isArray(t.tags)
      ? t.tags.filter((v: unknown): v is string => typeof v === "string")
      : [];
    const reminder_at: string | null =
      typeof t.reminder_at === "string" ? t.reminder_at : null;
    return { ...t, subtasks, tags, reminder_at } as Task;
  });
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return migrate(JSON.parse(raw));
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
