type View = "list" | "kanban";

interface Props {
  keyword: string;
  onKeywordChange: (v: string) => void;
  view: View;
  onViewChange: (v: View) => void;
  onNewTask: () => void;
}

export function Header({
  keyword,
  onKeywordChange,
  view,
  onViewChange,
  onNewTask,
}: Props) {
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
      <button
        type="button"
        className={`view-switch ${view === "kanban" ? "is-kanban" : "is-list"}`}
        role="switch"
        aria-checked={view === "kanban"}
        aria-label="ビュー切替"
        onClick={() => onViewChange(view === "list" ? "kanban" : "list")}
      >
        <span className="view-switch-track">
          <span className="view-switch-option" aria-hidden="true">
            <span className="view-switch-icon">☰</span>
            一覧
          </span>
          <span className="view-switch-option" aria-hidden="true">
            <span className="view-switch-icon">▦</span>
            カンバン
          </span>
          <span className="view-switch-thumb" aria-hidden="true">
            <span className="view-switch-icon">
              {view === "kanban" ? "▦" : "☰"}
            </span>
            {view === "kanban" ? "カンバン" : "一覧"}
          </span>
        </span>
      </button>
      <button className="primary" onClick={onNewTask}>
        + 新規タスク
      </button>
    </header>
  );
}

export type { View };
