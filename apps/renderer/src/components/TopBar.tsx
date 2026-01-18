type TopBarProps = {
  sessionName?: string;
  campaignName?: string;
  mode: "LIVE" | "COMBAT";
  onToggleMode: () => void;
  onSaveSession: () => void;
  onReset: () => void;
  onSaveNow: () => void;
  onShowPaths: () => void;
  onSelectDataPath: () => void;
  onShowStart: () => void;
  onShowDiag: () => void;
  onShowPCLibrary?: () => void;
  onShowNPCLibrary?: () => void;
  onShowMonsterLibrary?: () => void;
  onShowSessionLogs?: () => void;
  saveStatus?: string;
};

export function TopBar({
  sessionName,
  campaignName,
  mode,
  onToggleMode,
  onSaveSession,
  onReset,
  onSaveNow,
  onShowPaths,
  onSelectDataPath,
  onShowStart,
  onShowDiag,
  onShowPCLibrary,
  onShowNPCLibrary,
  onShowMonsterLibrary,
  onShowSessionLogs,
  saveStatus
}: TopBarProps) {
  const title = sessionName ?? campaignName ?? "Kampanie";
  return (
    <header className="topbar">
      <div className="topbar__title">
        {sessionName ? (
          <span className={`pill ${mode === "COMBAT" ? "pill--combat" : "pill--live"}`}>
            {mode}
          </span>
        ) : null}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className="title-text">{title}</span>
          {campaignName && sessionName ? (
            <span style={{ color: "#9aa6b8", fontSize: 12 }}>Kampania: {campaignName}</span>
          ) : null}
        </div>
      </div>
      <div className="topbar__actions">
        <button className="btn btn--ghost" onClick={onShowDiag}>
          Diagnostyka
        </button>
        <button className="btn btn--ghost" onClick={onShowPaths}>
          Ścieżka pliku
        </button>
        <button className="btn" onClick={onSelectDataPath}>
          Zmień folder danych
        </button>
        <button className="btn" onClick={() => onShowSessionLogs?.()}>
          Logi sesji
        </button>
        <button className="btn" onClick={onToggleMode}>
          {mode === "LIVE" ? "Przejdź do walki" : "Wróć do LIVE"}
        </button>
        <button className="btn" onClick={() => onShowPCLibrary?.()}>
          Postacie graczy
        </button>
        <button className="btn" onClick={() => onShowNPCLibrary?.()}>
          NPC
        </button>
        <button className="btn" onClick={() => onShowMonsterLibrary?.()}>
          Potwory
        </button>
        {saveStatus ? <span className="muted">{saveStatus}</span> : null}
        <button className="btn btn--ghost" onClick={onShowStart}>
          Kampanie
        </button>
        <button className="btn btn--primary" onClick={onSaveSession}>
          Zapisz sesję
        </button>
      </div>
    </header>
  );
}