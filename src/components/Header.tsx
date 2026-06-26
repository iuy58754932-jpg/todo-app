type View = "list" | "kanban" | "calendar";

const VIEW_OPTIONS: { value: View; label: string; icon: string }[] = [
  { value: "list", label: "一覧", icon: "☰" },
  { value: "kanban", label: "カンバン", icon: "▦" },
  { value: "calendar", label: "カレンダー", icon: "▤" },
];

interface Props {
  keyword: string;
  onKeywordChange: (v: string) => void;
  view: View;
  onViewChange: (v: View) => void;
  onNewTask: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
}

export function Header({
  keyword,
  onKeywordChange,
  view,
  onViewChange,
  onNewTask,
  notificationsEnabled,
  onToggleNotifications,
}: Props) {
  const activeIndex = VIEW_OPTIONS.findIndex((o) => o.value === view);
  return (
    <header className="app-header">
      <div className="app-title">Todo</div>
      <input
        className="search"
        type="search"
        placeholder="検索..."
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
      />
      <div
        className="view-switch"
        role="tablist"
        aria-label="ビュー切替"
        style={{ ["--active-index" as string]: activeIndex }}
      >
        <span className="view-switch-thumb" aria-hidden="true" />
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={view === opt.value}
            className={`view-switch-option ${
              view === opt.value ? "active" : ""
            }`}
            onClick={() => onViewChange(opt.value)}
          >
            <span className="view-switch-icon">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={`notif-toggle ${notificationsEnabled ? "on" : ""}`}
        onClick={onToggleNotifications}
        aria-pressed={notificationsEnabled}
        title={
          notificationsEnabled ? "通知をオフにする" : "通知をオンにする"
        }
      >
        {notificationsEnabled ? "🔔" : "🔕"}
      </button>
      <button className="primary" onClick={onNewTask}>
        + 新規タスク
      </button>
    </header>
  );
}

export type { View };
