type Note = { id: string; text: string; tag: string };
type LogEntry = { id: string; text: string };

type CenterPanelProps = {
  mode: "LIVE" | "COMBAT";
  notes: Note[];
  logEntries: LogEntry[];
  noteTag: string;
  noteText: string;
  activeSceneTitle: string;
  onNoteTagChange: (value: string) => void;
  onNoteTextChange: (value: string) => void;
  onAddNote: () => void;
  onClearLog: () => void;
};

export function CenterPanel({
  mode,
  notes,
  logEntries,
  noteTag,
  noteText,
  activeSceneTitle,
  onNoteTagChange,
  onNoteTextChange,
  onAddNote,
  onClearLog
}: CenterPanelProps) {
  return (
    <section className="panel panel--center">
      <div className="mode-banner">Tryb: {mode === "LIVE" ? "LIVE" : "COMBAT (placeholder)"}</div>
      <div className="active-scene">
        <strong>Aktywna scena:</strong> {activeSceneTitle}
      </div>

      <div className="panel__section">
        <div className="panel__header">
          <h2>Notatki</h2>
          <div className="note-inputs">
            <input
              className="input input--tag"
              placeholder="Tag (np. NPC, Quest)"
              value={noteTag}
              onChange={(e) => onNoteTagChange(e.target.value)}
            />
            <input
              className="input input--text"
              placeholder="Treść notatki"
              value={noteText}
              onChange={(e) => onNoteTextChange(e.target.value)}
            />
            <button className="btn btn--ghost" onClick={onAddNote}>
              Dodaj notatkę
            </button>
          </div>
        </div>
        <div className="notes">
          {notes.map((note) => (
            <article key={note.id} className="note-card">
              {note.tag ? <span className="pill pill--tag">{note.tag}</span> : null}
              <p>{note.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="panel__section">
        <div className="panel__header">
          <h2>Log sesji</h2>
          <button className="btn btn--ghost" onClick={onClearLog}>
            Wyczyść log
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
    </section>
  );
}