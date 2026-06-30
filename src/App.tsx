import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { Header, type View } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { TaskItem } from "./components/TaskItem";
import { TaskModal, type TaskInput } from "./components/TaskModal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { EmptyState } from "./components/EmptyState";
import { KanbanBoard } from "./components/KanbanBoard";
import { CalendarView } from "./components/CalendarView";
import { loadTasks, nextId, saveTasks } from "./storage";
import type { Filters, StatusCode, Task } from "./types";

const DEFAULT_FILTERS: Filters = {
  status: "all",
  keyword: "",
  hideCompleted: false,
  sort: "created",
  tags: [],
};

const NOTIF_KEY = "todo-app.notifications.v1";

function nowIso(): string {
  return new Date().toISOString();
}

function sortTasks(tasks: Task[], sort: Filters["sort"]): Task[] {
  const copy = [...tasks];
  if (sort === "created") {
    copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
  } else if (sort === "due") {
    copy.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
  } else {
    copy.sort((a, b) => b.priority - a.priority);
  }
  return copy;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [view, setView] = useState<View>("list");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    () => localStorage.getItem(NOTIF_KEY) === "1",
  );
  const notifiedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, notificationsEnabled ? "1" : "0");
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!notificationsEnabled) return;
    if (typeof Notification === "undefined") return;

    const check = () => {
      const now = Date.now();
      console.log(
        "[reminder] check",
        new Date(now).toLocaleString(),
        "perm:",
        Notification.permission,
        "tasks:",
        tasks.length,
      );
      for (const t of tasks) {
        if (!t.reminder_at) continue;
        if (t.status === "done") continue;
        const at = new Date(t.reminder_at).getTime();
        const already = notifiedRef.current.has(t.id);
        console.log(
          "[reminder]",
          t.id,
          t.title,
          "at:",
          new Date(at).toLocaleString(),
          "diffMs:",
          now - at,
          "already:",
          already,
        );
        if (already) continue;
        if (Number.isNaN(at)) continue;
        if (at > now) continue;
        if (now - at > 24 * 60 * 60 * 1000) continue;
        notifiedRef.current.add(t.id);
        try {
          new Notification("リマインダー", {
            body: t.title,
            tag: `todo-${t.id}`,
          });
          console.log("[reminder] fired", t.id);
        } catch (err) {
          console.error("[reminder] fire error", err);
        }
      }
    };

    check();
    const id = window.setInterval(check, 30 * 1000);
    return () => window.clearInterval(id);
  }, [notificationsEnabled, tasks]);

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      return;
    }
    if (typeof Notification === "undefined") {
      alert("このブラウザは通知に対応していません。");
      return;
    }
    let perm = Notification.permission;
    if (perm === "default") {
      perm = await Notification.requestPermission();
    }
    if (perm !== "granted") {
      alert("通知が許可されませんでした。ブラウザ設定を確認してください。");
      return;
    }
    notifiedRef.current.clear();
    setNotificationsEnabled(true);
  };

  const visible = useMemo(() => {
    const kw = filters.keyword.trim().toLowerCase();
    let arr = tasks.filter((t) => {
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.hideCompleted && t.status === "done") return false;
      if (filters.tags.length > 0) {
        for (const tag of filters.tags) {
          if (!t.tags.includes(tag)) return false;
        }
      }
      if (kw) {
        const hay = [
          t.title,
          t.note ?? "",
          t.custom_status ?? "",
          ...t.tags,
          ...t.subtasks.map((s) => s.title),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
    arr = sortTasks(arr, filters.sort);
    return arr;
  }, [tasks, filters]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditing(t);
    setModalOpen(true);
  };

  const handleSubmit = (input: TaskInput) => {
    const now = nowIso();
    if (editing) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editing.id ? { ...t, ...input, updated_at: now } : t,
        ),
      );
    } else {
      const t: Task = {
        id: nextId(),
        ...input,
        created_at: now,
        updated_at: now,
      };
      setTasks((prev) => [t, ...prev]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleting) return;
    setTasks((prev) => prev.filter((t) => t.id !== deleting.id));
    setDeleting(null);
  };

  const handleToggleDone = (t: Task) => {
    const next: StatusCode = t.status === "done" ? "not_started" : "done";
    setTasks((prev) =>
      prev.map((x) =>
        x.id === t.id
          ? {
              ...x,
              status: next,
              custom_status: null,
              updated_at: nowIso(),
            }
          : x,
      ),
    );
  };

  const handleStatusChange = (t: Task, next: StatusCode) => {
    setTasks((prev) =>
      prev.map((x) =>
        x.id === t.id
          ? {
              ...x,
              status: next,
              custom_status:
                next === "other" ? x.custom_status ?? "" : null,
              updated_at: nowIso(),
            }
          : x,
      ),
    );
  };

  return (
    <div className="app">
      <Header
        keyword={filters.keyword}
        onKeywordChange={(v) => setFilters({ ...filters, keyword: v })}
        view={view}
        onViewChange={setView}
        onNewTask={openNew}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
      />

      <div className="body">
        <Sidebar tasks={tasks} filters={filters} onFiltersChange={setFilters} />

        <main className="content">
          {view === "kanban" ? (
            tasks.length === 0 ? (
              <EmptyState onNewTask={openNew} />
            ) : (
              <KanbanBoard
                tasks={visible}
                onEdit={openEdit}
                onDelete={setDeleting}
                onStatusChange={handleStatusChange}
                onNewTask={openNew}
              />
            )
          ) : view === "calendar" ? (
            tasks.length === 0 ? (
              <EmptyState onNewTask={openNew} />
            ) : (
              <CalendarView tasks={visible} onSelectTask={openEdit} />
            )
          ) : tasks.length === 0 ? (
            <EmptyState onNewTask={openNew} />
          ) : visible.length === 0 ? (
            <div className="empty-filter">
              該当するタスクがありません。フィルタや検索条件を確認してください。
            </div>
          ) : (
            <ul className="task-list">
              {visible.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onEdit={openEdit}
                  onDelete={setDeleting}
                  onToggleDone={handleToggleDone}
                />
              ))}
            </ul>
          )}
        </main>
      </div>

      <TaskModal
        open={modalOpen}
        initial={editing}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleting}
        title="タスクを削除"
        message={deleting ? `「${deleting.title}」を削除しますか？` : ""}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default App;
