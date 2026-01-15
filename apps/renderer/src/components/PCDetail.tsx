import React, { useEffect, useState } from "react";
import { AbilityScores, PlayerCharacter } from "../types/pc";
import { PCForm } from "./PCForm";

type PCDetailProps = {
  pc: PlayerCharacter;
  onUpdate: (id: string, patch: Partial<PlayerCharacter>) => void;
  onSaveFull: (pc: PlayerCharacter) => void;
};

export function PCDetail({ pc, onUpdate, onSaveFull }: PCDetailProps) {
  const [hpValue, setHpValue] = useState<number>(pc.hpCurrent);
  const [newCondition, setNewCondition] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setHpValue(pc.hpCurrent);
  }, [pc.id, pc.hpCurrent]);

  const saveHp = () => {
    const val = Number(hpValue);
    if (Number.isNaN(val)) return;
    onUpdate(pc.id, { hpCurrent: val });
  };

  const addCondition = () => {
    const trimmed = newCondition.trim();
    if (!trimmed) return;
    const unique = Array.from(new Set([...(pc.conditions ?? []), trimmed]));
    onUpdate(pc.id, { conditions: unique });
    setNewCondition("");
  };

  const removeCondition = (cond: string) => {
    onUpdate(pc.id, {
      conditions: (pc.conditions ?? []).filter((c) => c !== cond)
    });
  };

  if (isEditing) {
    return (
      <PCForm
        initial={pc}
        onSubmit={(updated: PlayerCharacter) => {
          onSaveFull(updated);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="panel" style={{ gap: 12 }}>
      <div className="panel__header">
        <div>
          <h3 style={{ margin: 0 }}>{pc.name}</h3>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            {pc.className} — Poziom {pc.level}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setIsEditing(true)}>
            Edytuj
          </button>
          <button className="btn" onClick={saveHp}>
            Zapisz HP
          </button>
        </div>
      </div>

      <div className="panel__section" style={{ display: "flex", gap: 12 }}>
        <div className="stat-card">
          <div className="stat-card__label">HP</div>
          <div className="stat-card__value">
            <input
              className="input"
              type="number"
              value={hpValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setHpValue(Number(e.target.value) || 0)
              }
              style={{ width: "100%" }}
            />
            <span style={{ color: "var(--muted)", fontSize: 12 }}>/ {pc.hpMax}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">AC</div>
          <div className="stat-card__value">{pc.ac}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Inicjatywa</div>
          <div className="stat-card__value">{pc.initiative ?? "—"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Szybkość</div>
          <div className="stat-card__value">{pc.speed}</div>
        </div>
      </div>

      <div className="panel__section">
        <h4>Opis</h4>
        <div className="log__item">{pc.description?.trim() || "Brak opisu"}</div>
      </div>

      <div className="panel__section">
        <h4>Słabości</h4>
        <div className="log__item">{pc.weaknesses?.trim() || "Brak"}</div>
      </div>

      <div className="panel__section">
        <h4>Warunki</h4>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
          <input
            className="input"
            placeholder="Dodaj warunek"
            value={newCondition}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewCondition(e.target.value)
            }
          />
          <button className="btn" onClick={addCondition} disabled={!newCondition.trim()}>
            Dodaj
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(pc.conditions ?? []).map((cond) => (
            <span key={cond} className="pill pill--tag" onClick={() => removeCondition(cond)}>
              {cond}
            </span>
          ))}
          {(pc.conditions ?? []).length === 0 ? <span>Brak warunków</span> : null}
        </div>
      </div>

      <div className="panel__section">
        <h4>Atrybuty</h4>
        <div className="abilities-grid">
          {(Object.entries(pc.abilities) as [keyof AbilityScores, number][]).map(
            ([key, val]) => (
              <div key={String(key)} className="form-field">
                <span>{String(key).toUpperCase()}</span>
                <div className="pill pill--tag">{val}</div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="panel__section">
        <h4>Umiejętności</h4>
        <ul className="skill-list">
          {(pc.skills ?? []).map((s, idx) => (
            <li key={`${s.name}-${idx}`} className="log__item" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{s.name}</span>
              <span>{s.value}</span>
            </li>
          ))}
          {(pc.skills ?? []).length === 0 ? <li className="log__item">Brak umiejętności</li> : null}
        </ul>
      </div>

      <div className="panel__section">
        <h4>Ekwipunek</h4>
        <ul className="log">
          {(pc.inventory ?? []).map((item) => (
            <li key={item.id} className="log__item">
              {item.name} x{item.qty} {item.note ? `- ${item.note}` : ""}
            </li>
          ))}
          {(pc.inventory ?? []).length === 0 ? <li className="log__item">Brak ekwipunku</li> : null}
        </ul>
      </div>

      <div className="panel__section">
        <h4>Cechy / Features</h4>
        <ul className="log">
          {(pc.features ?? []).map((f) => (
            <li key={f.id} className="log__item">
              {f.name} {f.note ? `- ${f.note}` : ""}
            </li>
          ))}
          {(pc.features ?? []).length === 0 ? <li className="log__item">Brak cech</li> : null}
        </ul>
      </div>

      <div className="panel__section">
        <h4>Czary</h4>
        <ul className="log">
          {(pc.spells ?? []).map((s) => (
            <li key={s.id} className="log__item">
              {s.name} {s.note ? `- ${s.note}` : ""}
            </li>
          ))}
          {(pc.spells ?? []).length === 0 ? <li className="log__item">Brak czarów</li> : null}
        </ul>
      </div>
    </div>
  );
}

// Explicit re-export to guarantee the named export is available for Vite module resolution.
export { PCDetail as PCDetailComponent };