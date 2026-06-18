interface Props {
  onNewTask: () => void;
}

export function EmptyState({ onNewTask }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📋</div>
      <h2>タスクがありません</h2>
      <p>「新規タスク」から最初のタスクを追加してください。</p>
      <button className="primary" onClick={onNewTask}>
        + 新規タスク
      </button>
    </div>
  );
}
