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
      <div className="view-toggle" role="group" aria-label="ビュー切替">
        <button
          className={view === "list" ? "active" : ""}
          onClick={() => onViewChange("list")}
          aria-pressed={view === "list"}
        >
          <span className="view-toggle-icon" aria-hidden="true">☰</span>
          一覧
        </button>
        <button
          className={view === "kanban" ? "active" : ""}
          onClick={() => onViewChange("kanban")}
          aria-pressed={view === "kanban"}
        >
          <span className="view-toggle-icon" aria-hidden="true">▦</span>
          カンバン
        </button>
      </div>
      <button className="primary" onClick={onNewTask}>
        + 新規タスク
      </button>
    </header>
  );
}

export type { View };
