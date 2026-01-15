import { useState } from "react";

type CampaignCard = {
  id: string;
  name: string;
};

type StartViewProps = {
  campaigns: CampaignCard[];
  onEnter: (campaignId: string) => void;
  onCreate: (name: string) => void;
};

export function StartView({ campaigns, onEnter, onCreate }: StartViewProps) {
  const [newCampaignName, setNewCampaignName] = useState("");

  const handleCreate = () => {
    const trimmed = newCampaignName.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setNewCampaignName("");
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
          {campaigns.map((c) => (
            <li key={c.id} className="scene-item" onClick={() => onEnter(c.id)}>
              <div className="scene-item__title">{c.name}</div>
              <button
                className="btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnter(c.id);
                }}
              >
                Wejdź
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}