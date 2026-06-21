import {
  STATUS_LABELS,
  STATUS_ORDER,
  type Filters,
  type SortKey,
  type StatusCode,
  type Task,
} from "../types";

interface Props {
  tasks: Task[];
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
}

export function Sidebar({ tasks, filters, onFiltersChange }: Props) {
  const counts: Record<StatusCode | "all", number> = {
    all: tasks.length,
    not_started: 0,
    in_progress: 0,
    done: 0,
    other: 0,
  };
  for (const t of tasks) counts[t.status] += 1;

  const tagCounts = new Map<string, number>();
  for (const t of tasks) {
    for (const tag of t.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const allTags = [...tagCounts.keys()].sort((a, b) => a.localeCompare(b));

  const setStatus = (s: Filters["status"]) =>
    onFiltersChange({ ...filters, status: s });
  const setSort = (sort: SortKey) => onFiltersChange({ ...filters, sort });
  const setHide = (hideCompleted: boolean) =>
    onFiltersChange({ ...filters, hideCompleted });
  const toggleTag = (tag: string) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((x) => x !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: next });
  };
  const clearTags = () => onFiltersChange({ ...filters, tags: [] });

  return (
    <aside className="sidebar">
      <section>
        <h3>ステータス</h3>
        <ul className="status-filter">
          <li>
            <button
              className={filters.status === "all" ? "active" : ""}
              onClick={() => setStatus("all")}
            >
              <span>すべて</span>
              <span className="count">{counts.all}</span>
            </button>
          </li>
          {STATUS_ORDER.map((s) => (
            <li key={s}>
              <button
                className={filters.status === s ? "active" : ""}
                onClick={() => setStatus(s)}
              >
                <span>{STATUS_LABELS[s]}</span>
                <span className="count">{counts[s]}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>並び替え</h3>
        <select
          value={filters.sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="created">作成日</option>
          <option value="due">期限</option>
          <option value="priority">優先度</option>
        </select>
      </section>

      <section>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.hideCompleted}
            onChange={(e) => setHide(e.target.checked)}
          />
          完了を非表示
        </label>
      </section>

      {allTags.length > 0 && (
        <section>
          <div className="sidebar-section-head">
            <h3>タグ</h3>
            {filters.tags.length > 0 && (
              <button className="sidebar-clear" onClick={clearTags}>
                クリア
              </button>
            )}
          </div>
          <ul className="tag-filter">
            {allTags.map((tag) => {
              const active = filters.tags.includes(tag);
              return (
                <li key={tag}>
                  <button
                    className={active ? "active" : ""}
                    onClick={() => toggleTag(tag)}
                  >
                    <span># {tag}</span>
                    <span className="count">{tagCounts.get(tag)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </aside>
  );
}
