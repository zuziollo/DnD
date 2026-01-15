type TopBarProps = {
  sessionName: string;
  mode: "LIVE" | "COMBAT";
  onToggleMode: () => void;
  onAddNote: () => void;
  onReset: () => void;
  onSaveNow: () => void;
  onShowPaths: () => void;
  onSelectDataPath: () => void;
  onShowStart: () => void;
  onShowDiag: () => void;
  onShowPCLibrary?: () => void;
  onShowNPCLibrary?: () => void;
  onShowMonsterLibrary?: () => void;
};

export function TopBar({
  sessionName,
  mode,
  onToggleMode,
  onAddNote,
  onReset,
  onSaveNow,
  onShowPaths,
  onSelectDataPath,
  onShowStart,
  onShowDiag,
  onShowPCLibrary,
  onShowNPCLibrary,
  onShowMonsterLibrary
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__title">
        <span className={`pill ${mode === "COMBAT" ? "pill--combat" : "pill--live"}`}>
          {mode}
        </span>
        <span className="title-text">{sessionName}</span>
      </div>
      <div className="topbar__actions">
        <button className="btn">Generator</button>
        <button className="btn" onClick={onToggleMode}>
          {mode === "LIVE" ? "Przejdź do walki" : "Wróć do LIVE"}
        </button>
        <button className="btn btn--primary" onClick={onAddNote}>
          Zapisz notatkę
        </button>
        <button className="btn btn--ghost" onClick={onReset}>
          Reset danych
        </button>
        <button className="btn" onClick={onSaveNow}>
          Zapisz teraz
        </button>
        <button className="btn btn--ghost" onClick={onShowPaths}>
          Pokaż ścieżkę pliku
        </button>
        <button className="btn" onClick={onSelectDataPath}>
          Zmień folder danych
        </button>
        <button className="btn" onClick={() => onShowPCLibrary?.()}>
          Biblioteka PC
        </button>
        <button className="btn" onClick={() => onShowNPCLibrary?.()}>
          Biblioteka NPC
        </button>
        <button className="btn" onClick={() => onShowMonsterLibrary?.()}>
          Potwory
        </button>
        <button className="btn btn--ghost" onClick={onShowStart}>
          Kampanie
        </button>
        <button className="btn btn--ghost" onClick={onShowDiag}>
          Pokaż diagnostykę
        </button>
      </div>
    </header>
  );
}