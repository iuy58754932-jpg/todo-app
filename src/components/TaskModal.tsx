import { useEffect, useState } from "react";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  type Priority,
  type StatusCode,
  type Task,
} from "../types";

export interface TaskInput {
  title: string;
  status: StatusCode;
  custom_status: string | null;
  note: string | null;
  due_date: string | null;
  priority: Priority;
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
  priority: 1,
};

export function TaskModal({ open, initial, onCancel, onSubmit }: Props) {
  const [form, setForm] = useState<TaskInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title,
        status: initial.status,
        custom_status: initial.custom_status,
        note: initial.note,
        due_date: initial.due_date,
        priority: initial.priority,
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [open, initial]);

  if (!open) return null;

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
    onSubmit({
      ...form,
      title,
      custom_status:
        form.status === "other" ? (form.custom_status ?? "").trim() : null,
      note: form.note?.trim() ? form.note.trim() : null,
      due_date: form.due_date || null,
    });
  };

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
