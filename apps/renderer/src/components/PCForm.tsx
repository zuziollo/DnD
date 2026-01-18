import React, { useState } from "react";
import {
  AbilityScores,
  Feature,
  InventoryItem,
  PlayerCharacter,
  Skill,
  Spell
} from "../types/pc";

type PCFormProps = {
  initial?: PlayerCharacter;
  onSubmit: (pc: PlayerCharacter) => void;
  onCancel: () => void;
};

function defaultAbilities(): AbilityScores {
  return { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
}

export function PCForm({ initial, onSubmit, onCancel }: PCFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [className, setClassName] = useState(initial?.className ?? "");
  const [level, setLevel] = useState<number>(initial?.level ?? 1);
  const [hpMax, setHpMax] = useState<number>(initial?.hpMax ?? 10);
  const [hpCurrent, setHpCurrent] = useState<number>(initial?.hpCurrent ?? hpMax);
  const [ac, setAc] = useState<number>(initial?.ac ?? 10);
  const [initiative, setInitiative] = useState<number | undefined>(initial?.initiative);
  const [description, setDescription] = useState<string>(initial?.description ?? "");
  const [speed, setSpeed] = useState<number>(initial?.speed ?? 30);
  const [weaknesses, setWeaknesses] = useState<string>(initial?.weaknesses ?? "");
  const [conditions, setConditions] = useState<string[]>(initial?.conditions ?? []);
  const [skills, setSkills] = useState<Skill[]>(initial?.skills ?? []);
  const [abilities, setAbilities] = useState<AbilityScores>(initial?.abilities ?? defaultAbilities());
  const [inventory, setInventory] = useState<InventoryItem[]>(initial?.inventory ?? []);
  const [features, setFeatures] = useState<Feature[]>(initial?.features ?? []);
  const [spells, setSpells] = useState<Spell[]>(initial?.spells ?? []);
  const [newSkillName, setNewSkillName] = useState<string>("");
  const [newSkillValue, setNewSkillValue] = useState<number>(0);
  const [newCondition, setNewCondition] = useState<string>("");
  const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const cleanClass = className.trim();
    const payload: PlayerCharacter = {
      id: initial?.id ?? `pc-${Date.now()}`,
      campaignId: initial?.campaignId ?? "",
      name: trimmed,
      className: cleanClass || "Adventurer",
      level: Number(level) || 1,
      hpMax: Number(hpMax) || 0,
      hpCurrent: Number(hpCurrent) || 0,
      ac: Number(ac) || 0,
      initiative: initiative === undefined ? undefined : Number(initiative),
      description: description.trim(),
      speed: Number(speed) || 0,
      weaknesses: weaknesses.trim(),
      conditions,
      skills,
      abilities,
      inventory,
      features,
      spells
    };
    onSubmit(payload);
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills((prev: Skill[]) => [
      ...prev,
      { name: newSkillName.trim(), value: Number(newSkillValue) || 0 }
    ]);
    setNewSkillName("");
    setNewSkillValue(0);
  };

  const addCondition = () => {
    if (!newCondition.trim()) return;
    setConditions((prev: string[]) => Array.from(new Set([...prev, newCondition.trim()])));
    setNewCondition("");
  };

  const addInventoryItem = () => {
    setInventory((prev: InventoryItem[]) => [
      ...prev,
      { id: makeId(), name: "", qty: 1, note: "" }
    ]);
  };

  const updateInventoryItem = (
    id: string,
    key: "name" | "qty" | "note",
    value: string | number
  ) => {
    setInventory((prev: InventoryItem[]) =>
      prev.map((item: InventoryItem) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const removeInventoryItem = (id: string) => {
    setInventory((prev: InventoryItem[]) => prev.filter((item: InventoryItem) => item.id !== id));
  };

  const addFeature = () => {
    setFeatures((prev: Feature[]) => [...prev, { id: makeId(), name: "", note: "" }]);
  };

  const updateFeature = (id: string, key: "name" | "note", value: string) => {
    setFeatures((prev: Feature[]) =>
      prev.map((f: Feature) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  const removeFeature = (id: string) => {
    setFeatures((prev: Feature[]) => prev.filter((f: Feature) => f.id !== id));
  };

  const addSpell = () => {
    setSpells((prev: Spell[]) => [...prev, { id: makeId(), name: "", note: "" }]);
  };

  const updateSpell = (id: string, key: "name" | "note", value: string) => {
    setSpells((prev: Spell[]) => prev.map((s: Spell) => (s.id === id ? { ...s, [key]: value } : s)));
  };

  const removeSpell = (id: string) => {
    setSpells((prev: Spell[]) => prev.filter((s: Spell) => s.id !== id));
  };

  return (
    <div className="panel pc-form" style={{ gap: 16 }}>
      <div className="panel__header">
        <h3>{initial ? "Edytuj postać" : "Nowa postać"}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={handleSubmit} disabled={!name.trim()}>
            Zapisz
          </button>
          <button className="btn btn--ghost" onClick={onCancel}>
            Anuluj
          </button>
        </div>
      </div>

      <div className="form-section">
        <h4 className="section-title">Dane podstawowe</h4>
        <div className="field">
          <label className="label">Imię</label>
          <input
            className="input"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="label">Klasa</label>
          <input
            className="input"
            value={className}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClassName(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="label">Opis postaci</label>
          <textarea
            className="input"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setDescription(e.target.value)
            }
            rows={3}
          />
        </div>
        <div className="field">
          <label className="label">Poziom</label>
          <input
            className="input"
            type="number"
            value={level}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLevel(Number(e.target.value) || 1)}
          />
        </div>
        <div className="field">
          <label className="label">Szybkość</label>
          <input
            className="input"
            type="number"
            value={speed}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSpeed(Number(e.target.value) || 0)
            }
          />
        </div>
        <div className="field">
          <label className="label">Słabości</label>
          <textarea
            className="input"
            value={weaknesses}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setWeaknesses(e.target.value)
            }
            rows={2}
          />
        </div>
        <div className="field">
          <label className="label">HP max</label>
          <input
            className="input"
            type="number"
            value={hpMax}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHpMax(Number(e.target.value) || 0)}
          />
        </div>
        <div className="field">
          <label className="label">HP obecne</label>
          <input
            className="input"
            type="number"
            value={hpCurrent}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHpCurrent(Number(e.target.value) || 0)}
          />
        </div>
        <div className="field">
          <label className="label">AC</label>
          <input
            className="input"
            type="number"
            value={ac}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAc(Number(e.target.value) || 0)}
          />
        </div>
        <div className="field">
          <label className="label">Inicjatywa (opc.)</label>
          <input
            className="input"
            type="number"
            value={initiative ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInitiative(e.target.value === "" ? undefined : Number(e.target.value))
            }
          />
        </div>
      </div>

      <div className="form-section">
        <h4 className="section-title">Warunki</h4>
        <div className="field">
          <label className="label">Dodaj warunek</label>
          <div className="field-row">
            <input
              className="input"
              placeholder="np. Poisioned"
              value={newCondition}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCondition(e.target.value)}
            />
            <button className="btn" onClick={addCondition} disabled={!newCondition.trim()}>
              Dodaj
            </button>
          </div>
        </div>
        <div className="pill-row">
          {conditions.map((c) => (
            <span key={c} className="pill pill--tag">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h4 className="section-title">Umiejętności</h4>
        <div className="field">
          <label className="label">Dodaj umiejętność</label>
          <div className="field-row">
            <input
              className="input"
              placeholder="Nazwa"
              value={newSkillName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkillName(e.target.value)}
            />
            <input
              className="input"
              type="number"
              placeholder="Wartość"
              value={newSkillValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkillValue(Number(e.target.value) || 0)}
              style={{ maxWidth: 100 }}
            />
            <button className="btn" onClick={addSkill} disabled={!newSkillName.trim()}>
              Dodaj
            </button>
          </div>
        </div>
        <ul className="skill-list">
          {skills.map((s, idx) => (
            <li key={`${s.name}-${idx}`} className="log__item" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{s.name}</span>
              <span>{s.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="form-section">
        <h4 className="section-title">Atrybuty</h4>
        <div className="abilities-grid">
          {(Object.entries(abilities) as [keyof AbilityScores, number][]).map(([key, val]) => (
            <div key={String(key)} className="field">
              <label className="label">{String(key).toUpperCase()}</label>
              <input
                className="input"
                type="number"
                value={val}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAbilities((prev: AbilityScores) => ({
                    ...prev,
                    [key]: Number(e.target.value) || 0
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h4 className="section-title">Ekwipunek (prosty)</h4>
        <div className="list-stack">
          {inventory.map((item: InventoryItem) => (
            <div key={item.id} className="list-row">
              <div className="field">
                <label className="label">Nazwa</label>
                <input
                  className="input"
                  value={item.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateInventoryItem(item.id, "name", e.target.value)
                  }
                />
              </div>
              <div className="field">
                <label className="label">Ilość</label>
                <input
                  className="input"
                  type="number"
                  value={item.qty}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateInventoryItem(item.id, "qty", Number(e.target.value) || 0)
                  }
                />
              </div>
              <div className="field">
                <label className="label">Notatka (opc.)</label>
                <input
                  className="input"
                  value={item.note ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateInventoryItem(item.id, "note", e.target.value)
                  }
                />
              </div>
              <div className="row-actions">
                <button className="btn btn--ghost" onClick={() => removeInventoryItem(item.id)}>
                  Usuń
                </button>
              </div>
            </div>
          ))}
          <button className="btn" onClick={addInventoryItem}>
            + Dodaj przedmiot
          </button>
        </div>
      </div>

      <div className="form-section">
        <h4 className="section-title">Cechy / Features</h4>
        <div className="list-stack">
          {features.map((f: Feature) => (
            <div key={f.id} className="list-row">
              <div className="field">
                <label className="label">Nazwa</label>
                <input
                  className="input"
                  value={f.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateFeature(f.id, "name", e.target.value)
                  }
                />
              </div>
              <div className="field">
                <label className="label">Opis / notatka</label>
                <textarea
                  className="input"
                  value={f.note ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    updateFeature(f.id, "note", e.target.value)
                  }
                  rows={2}
                />
              </div>
              <div className="row-actions">
                <button className="btn btn--ghost" onClick={() => removeFeature(f.id)}>
                  Usuń
                </button>
              </div>
            </div>
          ))}
          <button className="btn" onClick={addFeature}>
            + Dodaj cechę
          </button>
        </div>
      </div>

      <div className="form-section">
        <h4 className="section-title">Czary</h4>
        <div className="list-stack">
          {spells.map((spell: Spell) => (
            <div key={spell.id} className="list-row">
              <div className="field">
                <label className="label">Nazwa czaru</label>
                <input
                  className="input"
                  value={spell.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateSpell(spell.id, "name", e.target.value)
                  }
                />
              </div>
              <div className="field">
                <label className="label">Notatka / opis</label>
                <textarea
                  className="input"
                  value={spell.note ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    updateSpell(spell.id, "note", e.target.value)
                  }
                  rows={2}
                />
              </div>
              <div className="row-actions">
                <button className="btn btn--ghost" onClick={() => removeSpell(spell.id)}>
                  Usuń
                </button>
              </div>
            </div>
          ))}
          <button className="btn" onClick={addSpell}>
            + Dodaj czar
          </button>
        </div>
      </div>
    </div>
  );
}

// Explicit re-export to guarantee the named export is available in all import styles.
export { PCForm as PCFormComponent };