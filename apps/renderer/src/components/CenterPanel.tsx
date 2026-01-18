type Note = { id: string; text: string; tag: string };
type CenterPanelProps = {
  mode: "LIVE" | "COMBAT";
  notes: Note[];
  noteTag: string;
  noteText: string;
  activeSceneTitle: string;
  onNoteTagChange: (value: string) => void;
  onNoteTextChange: (value: string) => void;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
};

export function CenterPanel({
  mode,
  notes,
  noteTag,
  noteText,
  activeSceneTitle,
  onNoteTagChange,
  onNoteTextChange,
  onAddNote,
  onDeleteNote
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
              <div className="note-card__header">
                {note.tag ? <span className="pill pill--tag">{note.tag}</span> : null}
                <button className="btn btn--ghost" onClick={() => onDeleteNote(note.id)}>
                  Usuń
                </button>
              </div>
              <p>{note.text}</p>
            </article>
          ))}
        </div>
      </div>

      {/* Logi sesji są w osobnym widoku */}
    </section>
  );
}