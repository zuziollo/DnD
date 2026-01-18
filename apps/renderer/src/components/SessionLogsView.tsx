type LogEntry = { id: string; text: string };

type SessionLogsViewProps = {
  logEntries: LogEntry[];
  onClose: () => void;
};

export function SessionLogsView({ logEntries, onClose }: SessionLogsViewProps) {
  return (
    <div className="panel" style={{ margin: 12 }}>
      <div className="panel__header">
        <h2>Logi sesji</h2>
        <button className="btn btn--ghost" onClick={onClose}>
          Powrót do sesji
        </button>
      </div>
      <ul className="log">
        {logEntries.map((entry) => (
          <li key={entry.id} className="log__item">
            {entry.text}
          </li>
        ))}
      </ul>
    </div>
  );
}