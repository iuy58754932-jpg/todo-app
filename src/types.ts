export type StatusCode = "not_started" | "in_progress" | "done" | "other";

export const STATUS_LABELS: Record<StatusCode, string> = {
  not_started: "未着手",
  in_progress: "進行中",
  done: "完了",
  other: "その他",
};

export const STATUS_ORDER: StatusCode[] = [
  "not_started",
  "in_progress",
  "done",
  "other",
];

export type Priority = 0 | 1 | 2;

export const PRIORITY_LABELS: Record<Priority, string> = {
  0: "低",
  1: "中",
  2: "高",
};

export interface Subtask {
  id: number;
  title: string;
  done: boolean;
}

export interface Task {
  id: number;
  title: string;
  status: StatusCode;
  custom_status: string | null;
  note: string | null;
  due_date: string | null;
  priority: Priority;
  subtasks: Subtask[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type SortKey = "created" | "due" | "priority";

export interface Filters {
  status: StatusCode | "all";
  keyword: string;
  hideCompleted: boolean;
  sort: SortKey;
  tags: string[];
}
