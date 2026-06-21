import { useState } from "react";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  type StatusCode,
  type Task,
} from "../types";

interface Props {
  tasks: Task[];
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onStatusChange: (t: Task, next: StatusCode) => void;
  onNewTask: () => void;
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime();
}

function columnLabel(status: StatusCode): string {
  return STATUS_LABELS[status];
}

export function KanbanBoard({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onNewTask,
}: Props) {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<StatusCode | null>(null);

  const byStatus: Record<StatusCode, Task[]> = {
    not_started: [],
    in_progress: [],
    done: [],
    other: [],
  };
  for (const t of tasks) {
    byStatus[t.status].push(t);
  }

  const handleDragStart = (e: React.DragEvent, t: Task) => {
    setDraggingId(t.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(t.id));
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOver(null);
  };

  const handleDragOver = (e: React.DragEvent, status: StatusCode) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOver !== status) setDragOver(status);
  };

  const handleDragLeave = (status: StatusCode) => {
    if (dragOver === status) setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, status: StatusCode) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("text/plain"));
    const task = tasks.find((t) => t.id === id);
    setDragOver(null);
    setDraggingId(null);
    if (!task || task.status === status) return;
    onStatusChange(task, status);
  };

  return (
    <div className="kanban">
      {STATUS_ORDER.map((status) => {
        const list = byStatus[status];
        return (
          <section
            key={status}
            className={`kanban-col status-${status} ${
              dragOver === status ? "drag-over" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={() => handleDragLeave(status)}
            onDrop={(e) => handleDrop(e, status)}
          >
            <header className="kanban-col-header">
              <span className={`kanban-col-title status-${status}`}>
                {columnLabel(status)}
              </span>
              <span className="kanban-col-count">{list.length}</span>
            </header>
            <div className="kanban-col-body">
              {list.length === 0 ? (
                <div className="kanban-empty">タスクなし</div>
              ) : (
                list.map((t) => {
                  const overdue = isOverdue(t.due_date, t.status);
                  return (
                    <article
                      key={t.id}
                      className={`kanban-card ${
                        draggingId === t.id ? "dragging" : ""
                      } ${t.status === "done" ? "done" : ""}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t)}
                      onDragEnd={handleDragEnd}
                      onDoubleClick={() => onEdit(t)}
                      title="ドラッグで移動 / ダブルクリックで編集"
                    >
                      <div className="kanban-card-title">{t.title}</div>
                      {t.note ? (
                        <div className="kanban-card-note">{t.note}</div>
                      ) : null}
                      {t.status === "other" && t.custom_status ? (
                        <div className="kanban-card-custom">
                          {t.custom_status}
                        </div>
                      ) : null}
                      <div className="kanban-card-meta">
                        <span className={`priority p-${t.priority}`}>
                          {PRIORITY_LABELS[t.priority]}
                        </span>
                        {t.due_date ? (
                          <span className={`due ${overdue ? "overdue" : ""}`}>
                            {t.due_date}
                          </span>
                        ) : null}
                      </div>
                      <div className="kanban-card-actions">
                        <button onClick={() => onEdit(t)}>編集</button>
                        <button className="danger" onClick={() => onDelete(t)}>
                          削除
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
            <button className="kanban-add" onClick={onNewTask}>
              + タスク追加
            </button>
          </section>
        );
      })}
    </div>
  );
}
