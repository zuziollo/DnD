import { useState } from "react";

type CampaignCard = {
  id: string;
  name: string;
  createdAt?: string;
};

type SessionCard = {
  id: string;
  campaignId: string;
  title: string;
  status?: "planned" | "active" | "ended";
  createdAt?: string;
};

type StartViewProps = {
  campaigns: CampaignCard[];
  sessions: SessionCard[];
  onOpenSession: (campaignId: string, sessionId: string) => void;
  onCreate: (name: string) => void;
  onCreateSession: (campaignId: string, title: string) => void;
  onDeleteCampaign: (campaignId: string) => void;
};

export function StartView({
  campaigns,
  sessions,
  onOpenSession,
  onCreate,
  onCreateSession,
  onDeleteCampaign
}: StartViewProps) {
  const [newCampaignName, setNewCampaignName] = useState("");
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [sessionFormCampaignId, setSessionFormCampaignId] = useState<string | null>(null);

  const handleCreate = () => {
    const trimmed = newCampaignName.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setNewCampaignName("");
  };

  const toggleCampaign = (campaignId: string) => {
    setExpandedCampaignId((prev) => (prev === campaignId ? null : campaignId));
    setSessionFormCampaignId(null);
    setNewSessionName("");
  };

  const handleOpenSessionForm = (campaignId: string) => {
    setSessionFormCampaignId(campaignId);
    setNewSessionName("");
  };

  const handleCancelSessionForm = () => {
    setSessionFormCampaignId(null);
    setNewSessionName("");
  };

  const handleSaveSession = (campaignId: string) => {
    const trimmed = newSessionName.trim();
    if (!trimmed) return;
    onCreateSession(campaignId, trimmed);
    setSessionFormCampaignId(null);
    setNewSessionName("");
  };

  const handleDeleteCampaign = (campaignId: string) => {
    const confirmed = window.confirm("Usunąć kampanię? Tej operacji nie da się cofnąć.");
    if (!confirmed) return;
    onDeleteCampaign(campaignId);
    if (expandedCampaignId === campaignId) {
      setExpandedCampaignId(null);
    }
    if (sessionFormCampaignId === campaignId) {
      setSessionFormCampaignId(null);
      setNewSessionName("");
    }
  };

  return (
    <div className="layout" style={{ gridTemplateColumns: "1fr" }}>
      <section className="panel">
        <div className="panel__header" style={{ gap: "8px" }}>
          <h2 className="panel__title">Kampanie</h2>
          <div style={{ display: "flex", gap: "8px", flex: 1, justifyContent: "flex-end" }}>
            <input
              className="input"
              placeholder="Nazwa kampanii"
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              style={{ maxWidth: "220px" }}
            />
            <button className="btn" onClick={handleCreate} disabled={!newCampaignName.trim()}>
              Nowa kampania
            </button>
          </div>
        </div>
        <ul className="scene-list">
          {campaigns.map((c) => {
            const campaignSessions = sessions.filter((session) => session.campaignId === c.id);

            return (
              <li key={c.id}>
                <div className="scene-item" onClick={() => toggleCampaign(c.id)}>
                  <div>
                    <div className="scene-item__title">{c.name}</div>
                    {c.createdAt ? (
                      <div style={{ color: "#9aa6b8", fontSize: 12 }}>
                        Utworzono: {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    ) : null}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      className="btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleCampaign(c.id);
                      }}
                    >
                      {expandedCampaignId === c.id ? "Zwiń" : "Rozwiń"}
                    </button>
                    <button
                      className="btn btn--ghost"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteCampaign(c.id);
                      }}
                    >
                      Usuń
                    </button>
                    <span style={{ color: "#9aa6b8", fontSize: 16 }}>
                      {expandedCampaignId === c.id ? "▼" : "▶"}
                    </span>
                  </div>
                </div>
                {expandedCampaignId === c.id ? (
                  <div
                    style={{
                      border: "1px solid #242a33",
                      borderRadius: "10px",
                      padding: "12px",
                      marginTop: "8px",
                      background: "rgba(255, 255, 255, 0.02)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button className="btn" onClick={() => handleOpenSessionForm(c.id)}>
                        + Dodaj sesję
                      </button>
                    </div>
                    {sessionFormCampaignId === c.id ? (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <input
                          className="input"
                          placeholder="Nazwa sesji"
                          value={newSessionName}
                          onChange={(e) => setNewSessionName(e.target.value)}
                          style={{ maxWidth: "240px" }}
                        />
                        <button
                          className="btn btn--primary"
                          onClick={() => handleSaveSession(c.id)}
                          disabled={!newSessionName.trim()}
                        >
                          Zapisz
                        </button>
                        <button className="btn btn--ghost" onClick={handleCancelSessionForm}>
                          Anuluj
                        </button>
                      </div>
                    ) : null}
                    <ul className="scene-list">
                      {campaignSessions.length === 0 ? (
                        <li style={{ color: "#9aa6b8", fontSize: 13 }}>Brak sesji</li>
                      ) : (
                        campaignSessions.map((session) => (
                          <li
                            key={session.id}
                            className="scene-item"
                            onClick={() => onOpenSession(c.id, session.id)}
                          >
                            <div>
                              <div className="scene-item__title">{session.title}</div>
                              {session.createdAt ? (
                                <div style={{ color: "#9aa6b8", fontSize: 12 }}>
                                  Utworzono: {new Date(session.createdAt).toLocaleDateString()}
                                </div>
                              ) : null}
                            </div>
                            <div style={{ color: "#9aa6b8", fontSize: 12 }}>
                              {session.status ?? "planned"}
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                ) : null}
              </li>
            );
          })}
          {campaigns.length === 0 ? <li>Brak kampanii</li> : null}
        </ul>
      </section>
    </div>
  );
}