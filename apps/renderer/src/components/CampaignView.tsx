import { useState } from "react";

export type CampaignViewProps = {
  campaignName: string;
  sessions: { id: string; title: string; status?: string }[];
  onOpenSession: (sessionId: string) => void;
  onCreateSession?: (title: string) => void;
  onBack?: () => void;
};

// Named export required by App.tsx
export function CampaignView({
  campaignName,
  sessions,
  onOpenSession,
  onCreateSession,
  onBack
}: CampaignViewProps) {
  const [newSessionName, setNewSessionName] = useState("");

  const handleCreate = () => {
    const trimmed = newSessionName.trim();
    if (!trimmed || !onCreateSession) return;
    onCreateSession(trimmed);
    setNewSessionName("");
  };

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}
      >
        <h2 style={{ margin: 0 }}>Sesje kampanii: {campaignName}</h2>
        {onBack ? (
          <button className="btn" onClick={onBack}>
            Wróć
          </button>
        ) : null}
        {onCreateSession ? (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              className="input"
              placeholder="Nazwa sesji"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              style={{ maxWidth: "220px" }}
            />
            <button className="btn" onClick={handleCreate} disabled={!newSessionName.trim()}>
              Utwórz sesję
            </button>
          </div>
        ) : null}
      </div>
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {sessions.map((session) => (
          <li
            key={session.id}
            style={{ border: "1px solid #2a2f38", borderRadius: "8px", padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <div>{session.title}</div>
            {session.status ? <div style={{ color: "#9aa6b8", fontSize: 12 }}>{session.status}</div> : null}
            <button className="btn" onClick={() => onOpenSession(session.id)}>
              Otwórz sesję
            </button>
          </li>
        ))}
        {sessions.length === 0 ? <li>Brak sesji</li> : null}
      </ul>
    </div>
  );
}