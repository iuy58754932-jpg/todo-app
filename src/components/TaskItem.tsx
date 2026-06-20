import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Task,
} from "../types";

interface Props {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onToggleDone: (t: Task) => void;
}

const STATUS_ICON: Record<string, string> = {
  not_started: "○",
  in_progress: "◐",
  done: "●",
  other: "◇",
};

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime();
}

function statusBadge(task: Task) {
  if (task.status === "other") {
    return task.custom_status?.trim() || STATUS_LABELS.other;
  }
  return STATUS_LABELS[task.status];
}

export function TaskItem({ task, onEdit, onDelete, onToggleDone }: Props) {
  const done = task.status === "done";
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <li className={`task-item ${done ? "done" : ""}`}>
      <button
        className="status-icon"
        onClick={() => onToggleDone(task)}
        aria-label="完了切替"
        title="完了切替"
      >
        {STATUS_ICON[task.status]}
      </button>
      <div
        className="task-main"
        onDoubleClick={() => onEdit(task)}
        title="ダブルクリックで編集"
      >
        <div className="task-title">{task.title}</div>
        {task.note ? <div className="task-note">{task.note}</div> : null}
      </div>
      <span className={`badge status-${task.status}`}>{statusBadge(task)}</span>
      <span
        className={`priority p-${task.priority}`}
        title={`優先度: ${PRIORITY_LABELS[task.priority]}`}
      >
        {PRIORITY_LABELS[task.priority]}
      </span>
      <span className={`due ${overdue ? "overdue" : ""}`}>
        {task.due_date ? task.due_date : "—"}
      </span>
      <div className="task-actions">
        <button onClick={() => onEdit(task)}>編集</button>
        <button className="danger" onClick={() => onDelete(task)}>
          削除
        </button>
      </div>
    </li>
  );
}
