import { useEffect, useState } from "react";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  type Priority,
  type StatusCode,
  type Subtask,
  type Task,
} from "../types";

export interface TaskInput {
  title: string;
  status: StatusCode;
  custom_status: string | null;
  note: string | null;
  due_date: string | null;
  reminder_at: string | null;
  priority: Priority;
  subtasks: Subtask[];
  tags: string[];
}

interface Props {
  open: boolean;
  initial?: Task | null;
  onCancel: () => void;
  onSubmit: (input: TaskInput) => void;
}

const EMPTY: TaskInput = {
  title: "",
  status: "not_started",
  custom_status: null,
  note: null,
  due_date: null,
  reminder_at: null,
  priority: 1,
  subtasks: [],
  tags: [],
};

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function nextSubtaskId(subs: Subtask[]): number {
  return subs.reduce((max, s) => (s.id > max ? s.id : max), 0) + 1;
}

function normalizeTag(t: string): string {
  return t.trim().replace(/\s+/g, " ");
}

export function TaskModal({ open, initial, onCancel, onSubmit }: Props) {
  const [form, setForm] = useState<TaskInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [subDraft, setSubDraft] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title,
        status: initial.status,
        custom_status: initial.custom_status,
        note: initial.note,
        due_date: initial.due_date,
        reminder_at: initial.reminder_at,
        priority: initial.priority,
        subtasks: initial.subtasks.map((s) => ({ ...s })),
        tags: [...initial.tags],
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
    setTagDraft("");
    setSubDraft("");
  }, [open, initial]);

  if (!open) return null;

  const commitTag = () => {
    const v = normalizeTag(tagDraft);
    if (!v) {
      setTagDraft("");
      return;
    }
    if (form.tags.includes(v)) {
      setTagDraft("");
      return;
    }
    setForm({ ...form, tags: [...form.tags, v] });
    setTagDraft("");
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTag();
    } else if (e.key === "Backspace" && !tagDraft && form.tags.length > 0) {
      e.preventDefault();
      setForm({ ...form, tags: form.tags.slice(0, -1) });
    }
  };

  const addSubtask = () => {
    const v = subDraft.trim();
    if (!v) return;
    const sub: Subtask = {
      id: nextSubtaskId(form.subtasks),
      title: v,
      done: false,
    };
    setForm({ ...form, subtasks: [...form.subtasks, sub] });
    setSubDraft("");
  };

  const handleSubKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubtask();
    }
  };

  const updateSubtask = (id: number, patch: Partial<Subtask>) => {
    setForm({
      ...form,
      subtasks: form.subtasks.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const removeSubtask = (id: number) => {
    setForm({ ...form, subtasks: form.subtasks.filter((s) => s.id !== id) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setError("タイトルは必須です");
      return;
    }
    if (form.status === "other" && !(form.custom_status ?? "").trim()) {
      setError("「その他」を選んだ場合は内容を入力してください");
      return;
    }
    const pendingTag = normalizeTag(tagDraft);
    const tags =
      pendingTag && !form.tags.includes(pendingTag)
        ? [...form.tags, pendingTag]
        : form.tags;
    const subtasks = form.subtasks
      .map((s) => ({ ...s, title: s.title.trim() }))
      .filter((s) => s.title);
    onSubmit({
      ...form,
      title,
      custom_status:
        form.status === "other" ? (form.custom_status ?? "").trim() : null,
      note: form.note?.trim() ? form.note.trim() : null,
      due_date: form.due_date || null,
      subtasks,
      tags,
    });
  };

  const doneCount = form.subtasks.filter((s) => s.done).length;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? "タスク編集" : "タスク追加"}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            タイトル
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            ステータス
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as StatusCode })
              }
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          {form.status === "other" && (
            <label>
              その他の内容
              <input
                value={form.custom_status ?? ""}
                onChange={(e) =>
                  setForm({ ...form, custom_status: e.target.value })
                }
                placeholder="例: 保留中"
              />
            </label>
          )}
          <label>
            備考
            <textarea
              rows={3}
              value={form.note ?? ""}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </label>
          <label>
            期限
            <input
              type="date"
              value={form.due_date ?? ""}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </label>
          <label>
            リマインダー
            <input
              type="datetime-local"
              value={toLocalInput(form.reminder_at)}
              onChange={(e) =>
                setForm({ ...form, reminder_at: fromLocalInput(e.target.value) })
              }
            />
          </label>
          <label>
            優先度
            <select
              value={form.priority}
              onChange={(e) =>
                setForm({
                  ...form,
                  priority: Number(e.target.value) as Priority,
                })
              }
            >
              {[2, 1, 0].map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p as Priority]}
                </option>
              ))}
            </select>
          </label>

          <div className="field">
            <div className="field-label-row">
              <span className="field-label">サブタスク</span>
              {form.subtasks.length > 0 && (
                <span className="field-hint">
                  {doneCount}/{form.subtasks.length} 完了
                </span>
              )}
            </div>
            {form.subtasks.length > 0 && (
              <ul className="subtask-edit">
                {form.subtasks.map((s) => (
                  <li key={s.id}>
                    <input
                      type="checkbox"
                      checked={s.done}
                      onChange={(e) =>
                        updateSubtask(s.id, { done: e.target.checked })
                      }
                    />
                    <input
                      type="text"
                      value={s.title}
                      onChange={(e) =>
                        updateSubtask(s.id, { title: e.target.value })
                      }
                      className={s.done ? "subtask-done" : ""}
                    />
                    <button
                      type="button"
                      className="subtask-remove"
                      onClick={() => removeSubtask(s.id)}
                      aria-label="削除"
                      title="削除"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="subtask-add">
              <input
                type="text"
                value={subDraft}
                onChange={(e) => setSubDraft(e.target.value)}
                onKeyDown={handleSubKey}
                placeholder="サブタスクを追加 (Enter)"
              />
              <button type="button" onClick={addSubtask}>
                追加
              </button>
            </div>
          </div>

          <div className="field">
            <span className="field-label">タグ</span>
            <div className="tag-input">
              {form.tags.map((t) => (
                <span key={t} className="tag-chip">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    aria-label={`${t}を削除`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={handleTagKey}
                onBlur={commitTag}
                placeholder={form.tags.length === 0 ? "Enterで追加" : ""}
              />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onCancel}>
              キャンセル
            </button>
            <button type="submit" className="primary">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
