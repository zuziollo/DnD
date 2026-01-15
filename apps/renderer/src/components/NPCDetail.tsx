import { useState } from "react";
import { NPC } from "../types/npc";
import { NPCForm } from "./NPCForm";

type NPCDetailProps = {
  npc: NPC;
  onUpdate: (npc: NPC) => void;
};

export function NPCDetail({ npc, onUpdate }: NPCDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [hpCurrent, setHpCurrent] = useState<number>(npc.hpCurrent ?? 0);

  const handleSave = (updated: NPC) => {
    setIsEditing(false);
    onUpdate(updated);
  };

  return (
    <div className="pc-detail">
      {isEditing ? (
        <NPCForm
          initial={npc}
          onSubmit={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="pc-detail__header">
            <div>
              <h2>{npc.name}</h2>
              <div className="muted">{npc.role}</div>
              <div className="muted">{npc.faction}</div>
            </div>
            <div className="pc-detail__actions">
              <button className="btn" onClick={() => setIsEditing(true)}>
                Edytuj
              </button>
            </div>
          </div>
          <div className="pc-detail__grid">
            <div>
              <div className="muted">HP</div>
              <div className="pc-detail__stat">
                <input
                  className="input input--inline"
                  type="number"
                  value={hpCurrent}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setHpCurrent(val);
                    onUpdate({ ...npc, hpCurrent: val });
                  }}
                  style={{ width: 80 }}
                />
                / {npc.hpMax ?? 0}
              </div>
            </div>
            <div>
              <div className="muted">AC</div>
              <div className="pc-detail__stat">{npc.ac ?? "-"}</div>
            </div>
          </div>

          {npc.description ? (
            <div className="pc-detail__section">
              <h3 className="sectionTitle">Opis</h3>
              <p>{npc.description}</p>
            </div>
          ) : null}

          {npc.weaknesses ? (
            <div className="pc-detail__section">
              <h3 className="sectionTitle">Słabości</h3>
              <p>{npc.weaknesses}</p>
            </div>
          ) : null}

          {npc.abilities?.length ? (
            <div className="pc-detail__section">
              <h3 className="sectionTitle">Zdolności / Ataki</h3>
              <ul className="log">
                {npc.abilities.map((ab) => (
                  <li key={ab.id} className="log__item">
                    <div className="pc-card__row">
                      <strong>{ab.name}</strong>
                      {ab.note ? <span className="muted">{ab.note}</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {npc.loot?.length ? (
            <div className="pc-detail__section">
              <h3 className="sectionTitle">Łup / Przedmioty</h3>
              <ul className="log">
                {npc.loot.map((item) => (
                  <li key={item.id} className="log__item">
                    <div className="pc-card__row">
                      <strong>{item.name}</strong>
                      {item.note ? <span className="muted">{item.note}</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {npc.dmNotes ? (
            <div className="pc-detail__section">
              <h3 className="sectionTitle">Notatki MG</h3>
              <p>{npc.dmNotes}</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}