import { useState } from "react";
import { NPC, NPCAttack, NPCLoot, NPCAbilities } from "../types/npc";

type NPCFormProps = {
  initial?: NPC;
  onSubmit: (npc: NPC) => void;
  onCancel: () => void;
};

const emptyAbilities: NPCAbilities = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

export function NPCForm({ initial, onSubmit, onCancel }: NPCFormProps) {
  const [npc, setNpc] = useState<NPC>(
    initial ?? {
      id: `npc-${Date.now()}`,
      campaignId: initial?.campaignId ?? "",
      name: "",
      role: "",
      faction: "",
      tags: [],
      description: "",
      hpMax: 0,
      hpCurrent: 0,
      ac: 10,
      keyStats: emptyAbilities,
      abilities: [],
      weaknesses: "",
      loot: [],
      dmNotes: ""
    }
  );
  const [tagInput, setTagInput] = useState<string>((initial?.tags ?? []).join(", "));

  const updateField = <K extends keyof NPC>(key: K, value: NPC[K]) => {
    setNpc((prev) => ({ ...prev, [key]: value }));
  };

  const handleAbilityChange = (key: keyof NPCAbilities, value: number) => {
    setNpc((prev) => ({
      ...prev,
      keyStats: { ...(prev.keyStats ?? emptyAbilities), [key]: value }
    }));
  };

  const handleSubmit = () => {
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSubmit({ ...npc, tags });
  };

  const addAbilityEntry = () => {
    const next: NPCAttack = { id: `atk-${Date.now()}`, name: "", note: "" };
    updateField("abilities", [...(npc.abilities ?? []), next]);
  };

  const updateAbilityEntry = (id: string, patch: Partial<NPCAttack>) => {
    updateField(
      "abilities",
      (npc.abilities ?? []).map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
  };

  const removeAbilityEntry = (id: string) => {
    updateField(
      "abilities",
      (npc.abilities ?? []).filter((a) => a.id !== id)
    );
  };

  const addLoot = () => {
    const next: NPCLoot = { id: `loot-${Date.now()}`, name: "", note: "" };
    updateField("loot", [...(npc.loot ?? []), next]);
  };

  const updateLoot = (id: string, patch: Partial<NPCLoot>) => {
    updateField(
      "loot",
      (npc.loot ?? []).map((l) => (l.id === id ? { ...l, ...patch } : l))
    );
  };

  const removeLoot = (id: string) => {
    updateField(
      "loot",
      (npc.loot ?? []).filter((l) => l.id !== id)
    );
  };

  return (
    <form className="form" onSubmit={(e) => e.preventDefault()}>
      <h2 className="sectionTitle">NPC</h2>
      <div className="field">
        <label className="label">Imię</label>
        <input
          className="input"
          value={npc.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label className="label">Rola / motywacja</label>
        <input
          className="input"
          value={npc.role}
          onChange={(e) => updateField("role", e.target.value)}
        />
      </div>
      <div className="field">
        <label className="label">Frakcja / tagi (oddzielone przecinkiem)</label>
        <input
          className="input"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="np. gildia, kupcy"
        />
      </div>
      <div className="field">
        <label className="label">Opis</label>
        <textarea
          className="input"
          value={npc.description ?? ""}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
        />
      </div>

      <h3 className="sectionTitle">Statystyki</h3>
      <div className="field">
        <label className="label">HP (aktualne / max)</label>
        <div className="field-row">
          <input
            className="input"
            type="number"
            value={npc.hpCurrent ?? 0}
            onChange={(e) => updateField("hpCurrent", Number(e.target.value) || 0)}
          />
          <input
            className="input"
            type="number"
            value={npc.hpMax ?? 0}
            onChange={(e) => updateField("hpMax", Number(e.target.value) || 0)}
          />
        </div>
      </div>
      <div className="field">
        <label className="label">AC</label>
        <input
          className="input"
          type="number"
          value={npc.ac ?? 0}
          onChange={(e) => updateField("ac", Number(e.target.value) || 0)}
        />
      </div>

      <div className="field">
        <label className="label">Kluczowe atrybuty (opcjonalnie)</label>
        <div className="ability-grid">
          {(Object.keys(emptyAbilities) as (keyof NPCAbilities)[]).map((key) => (
            <label key={key} className="ability-cell">
              <span className="label">{String(key).toUpperCase()}</span>
              <input
                className="input"
                type="number"
                value={npc.keyStats?.[key] ?? 0}
                onChange={(e) => handleAbilityChange(key, Number(e.target.value) || 0)}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="label">Słabości</label>
        <textarea
          className="input"
          value={npc.weaknesses ?? ""}
          onChange={(e) => updateField("weaknesses", e.target.value)}
          rows={2}
        />
      </div>

      <h3 className="sectionTitle">Zdolności / Ataki</h3>
      <button type="button" className="btn" onClick={addAbilityEntry}>
        + Dodaj zdolność
      </button>
      <div className="list-rows">
        {(npc.abilities ?? []).map((ab) => (
          <div key={ab.id} className="listRow">
            <input
              className="input"
              placeholder="Nazwa"
              value={ab.name}
              onChange={(e) => updateAbilityEntry(ab.id, { name: e.target.value })}
            />
            <input
              className="input"
              placeholder="Notatka"
              value={ab.note ?? ""}
              onChange={(e) => updateAbilityEntry(ab.id, { note: e.target.value })}
            />
            <div className="rowActions">
              <button type="button" className="btn btn--ghost" onClick={() => removeAbilityEntry(ab.id)}>
                Usuń
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="sectionTitle">Łup / Przedmioty</h3>
      <button type="button" className="btn" onClick={addLoot}>
        + Dodaj przedmiot
      </button>
      <div className="list-rows">
        {(npc.loot ?? []).map((item) => (
          <div key={item.id} className="listRow">
            <input
              className="input"
              placeholder="Nazwa"
              value={item.name}
              onChange={(e) => updateLoot(item.id, { name: e.target.value })}
            />
            <input
              className="input"
              placeholder="Notatka"
              value={item.note ?? ""}
              onChange={(e) => updateLoot(item.id, { note: e.target.value })}
            />
            <div className="rowActions">
              <button type="button" className="btn btn--ghost" onClick={() => removeLoot(item.id)}>
                Usuń
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="field">
        <label className="label">Notatki MG</label>
        <textarea
          className="input"
          value={npc.dmNotes ?? ""}
          onChange={(e) => updateField("dmNotes", e.target.value)}
          rows={3}
        />
      </div>

      <div className="field" style={{ gap: 8, flexDirection: "row" }}>
        <button type="button" className="btn btn--primary" onClick={handleSubmit}>
          Zapisz NPC
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Anuluj
        </button>
      </div>
    </form>
  );
}