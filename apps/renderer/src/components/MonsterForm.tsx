import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type {
  Monster,
  MonsterAction,
  MonsterLegendaryAttack,
  MonsterMovement,
  MonsterTrait,
  MonsterWeakness
} from "../types/monster";

type MonsterFormProps = {
  monster?: Monster;
  onSave: (monster: Monster) => void;
  onCancel: () => void;
};

const sizeOptions: Monster["size"][] = [
  "Tiny",
  "Small",
  "Medium",
  "Large",
  "Huge",
  "Gargantuan"
];

const alignmentOptions = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil"
];

const emptyMovement = (): MonsterMovement => ({ walk: true, fly: false, swim: false });

const emptyMonster = (): Monster => ({
  id: `monster-${Date.now()}`,
  name: "",
  type: "",
  cr: 1,
  hpMax: 0,
  ac: 10,
  speed: "30 ft",
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
  size: "Medium",
  alignment: "Neutral",
  movement: emptyMovement(),
  traits: [],
  actions: [],
  weaknesses: [],
  legendary: false,
  legendaryDescription: "",
  legendaryAttacks: [],
  languages: [],
  notes: ""
});

export function MonsterForm({ monster, onSave, onCancel }: MonsterFormProps) {
  const [form, setForm] = useState<Monster>(monster ?? emptyMonster());
  const isCustomAlignment = useMemo(
    () => !alignmentOptions.includes(form.alignment),
    [form.alignment]
  );
  const [customAlignment, setCustomAlignment] = useState(
    isCustomAlignment ? form.alignment : ""
  );
  type MonsterAbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
  const abilityFields: { key: MonsterAbilityKey; label: string }[] = [
    { key: "str", label: "Siła (STR)" },
    { key: "dex", label: "Zręczność (DEX)" },
    { key: "con", label: "Kondycja (CON)" },
    { key: "int", label: "Inteligencja (INT)" },
    { key: "wis", label: "Mądrość (WIS)" },
    { key: "cha", label: "Charyzma (CHA)" }
  ];
  const clampAbility = (value: number) => Math.min(30, Math.max(1, value));

  const updateField = (
    key: keyof Monster,
    value:
      | string
      | number
      | boolean
      | string[]
      | MonsterAction[]
      | MonsterLegendaryAttack[]
      | MonsterTrait[]
      | MonsterMovement
      | MonsterWeakness[]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addTrait = () => {
    const next: MonsterTrait = { id: `trait-${Date.now()}`, name: "", note: "" };
    updateField("traits", [...(form.traits ?? []), next]);
  };

  const addAction = () => {
    const next: MonsterAction = { id: `action-${Date.now()}`, name: "", note: "" };
    updateField("actions", [...(form.actions ?? []), next]);
  };

  const updateTrait = (id: string, patch: Partial<MonsterTrait>) => {
    updateField(
      "traits",
      (form.traits ?? []).map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  const updateAction = (id: string, patch: Partial<MonsterAction>) => {
    updateField(
      "actions",
      (form.actions ?? []).map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
  };

  const addLegendaryAttack = () => {
    const next: MonsterLegendaryAttack = {
      id: `legendary-attack-${Date.now()}`,
      name: "",
      description: ""
    };
    updateField("legendaryAttacks", [...(form.legendaryAttacks ?? []), next]);
  };

  const updateLegendaryAttack = (id: string, patch: Partial<MonsterLegendaryAttack>) => {
    updateField(
      "legendaryAttacks",
      (form.legendaryAttacks ?? []).map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
  };

  const removeLegendaryAttack = (id: string) => {
    updateField(
      "legendaryAttacks",
      (form.legendaryAttacks ?? []).filter((a) => a.id !== id)
    );
  };

  const removeTrait = (id: string) => {
    updateField(
      "traits",
      (form.traits ?? []).filter((t) => t.id !== id)
    );
  };

  const removeAction = (id: string) => {
    updateField(
      "actions",
      (form.actions ?? []).filter((a) => a.id !== id)
    );
  };

  const addWeakness = () => {
    const next: MonsterWeakness = {
      id: Date.now().toString(),
      name: "",
      note: ""
    };
    updateField("weaknesses", [...(form.weaknesses ?? []), next]);
  };

  const updateWeakness = (id: string, patch: Partial<MonsterWeakness>) => {
    updateField(
      "weaknesses",
      (form.weaknesses ?? []).map((w) => (w.id === id ? { ...w, ...patch } : w))
    );
  };

  const removeWeakness = (id: string) => {
    updateField(
      "weaknesses",
      (form.weaknesses ?? []).filter((w) => w.id !== id)
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      str: clampAbility(form.str ?? 10),
      dex: clampAbility(form.dex ?? 10),
      con: clampAbility(form.con ?? 10),
      int: clampAbility(form.int ?? 10),
      wis: clampAbility(form.wis ?? 10),
      cha: clampAbility(form.cha ?? 10),
      size: form.size ?? "Medium",
      alignment: (form.alignment ?? "Neutral").trim() || "Neutral",
      movement: form.movement ?? emptyMovement(),
      traits: form.traits ?? [],
      actions: form.actions ?? [],
      weaknesses: form.weaknesses ?? [],
      legendary: form.legendary ?? false,
      legendaryDescription: form.legendaryDescription ?? "",
      legendaryAttacks: form.legendaryAttacks ?? [],
      languages: form.languages ?? [],
      notes: form.notes ?? ""
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3 className="sectionTitle">Dane potwora</h3>
      <div className="field">
        <label className="label">Nazwa</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label className="label">Typ</label>
        <input className="input" value={form.type} onChange={(e) => updateField("type", e.target.value)} />
      </div>
      <div className="field">
        <label className="label">CR</label>
        <input
          className="input"
          type="number"
          value={form.cr}
          onChange={(e) => updateField("cr", Number(e.target.value))}
          min={0}
          step={0.25}
        />
      </div>
      <div className="field">
        <label className="label">HP maksymalne</label>
        <input
          className="input"
          type="number"
          value={form.hpMax}
          onChange={(e) => updateField("hpMax", Number(e.target.value))}
          min={0}
        />
      </div>
      <div className="field">
        <label className="label">AC</label>
        <input
          className="input"
          type="number"
          value={form.ac}
          onChange={(e) => updateField("ac", Number(e.target.value))}
          min={0}
        />
      </div>
      <div className="field">
        <label className="label">Szybkość</label>
        <input
          className="input"
          value={form.speed}
          onChange={(e) => updateField("speed", e.target.value)}
        />
      </div>
      <div className="field">
        <label className="label">Języki (oddzielone przecinkami)</label>
        <input
          className="input"
          value={form.languages?.join(", ") ?? ""}
          onChange={(e) =>
            updateField(
              "languages",
              e.target.value
                .split(",")
                .map((lang) => lang.trim())
                .filter(Boolean)
            )
          }
        />
      </div>

      <div className="field">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.legendary ?? false}
            onChange={() => updateField("legendary", !(form.legendary ?? false))}
          />
          Legendarny
        </label>
      </div>

      <div className="field">
        <label className="label">Rozmiar</label>
        <select
          className="input"
          value={form.size}
          onChange={(e) => updateField("size", e.target.value as Monster["size"])}
        >
          {sizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="label">Charakter (alignment)</label>
        <select
          className="input"
          value={isCustomAlignment ? "custom" : form.alignment}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "custom") {
              updateField("alignment", customAlignment || "Neutral");
            } else {
              updateField("alignment", value);
            }
          }}
        >
          {alignmentOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="custom">Inne...</option>
        </select>
        {isCustomAlignment ? (
          <input
            className="input"
            placeholder="Własny opis charakteru"
            value={customAlignment}
            onChange={(e) => {
              setCustomAlignment(e.target.value);
              updateField("alignment", e.target.value);
            }}
          />
        ) : null}
      </div>

      <div className="field">
        <label className="label">Atrybuty</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {abilityFields.map(({ key, label }) => (
            <div key={String(key)} className="field">
              <label className="label">{label}</label>
              <input
                className="input"
                type="number"
                min={1}
                max={30}
                value={form[key] ?? 10}
                onChange={(e) => updateField(key, clampAbility(Number(e.target.value) || 1))}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="label">Ruch</label>
        <div className="pill-row">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.movement?.walk ?? true}
              onChange={() =>
                updateField("movement", { ...form.movement, walk: !(form.movement?.walk ?? true) })
              }
            />
            Chodzi
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.movement?.fly ?? false}
              onChange={() =>
                updateField("movement", { ...form.movement, fly: !(form.movement?.fly ?? false) })
              }
            />
            Lata
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.movement?.swim ?? false}
              onChange={() =>
                updateField("movement", { ...form.movement, swim: !(form.movement?.swim ?? false) })
              }
            />
            Pływa
          </label>
        </div>
      </div>

      <div className="field">
        <label className="label">Słabości</label>
        <div className="list-rows">
          {(form.weaknesses ?? []).map((weakness) => (
            <div key={weakness.id} className="list-row">
              <label className="label">Nazwa słabości</label>
              <input
                className="input"
                value={weakness.name}
                onChange={(e) => updateWeakness(weakness.id, { name: e.target.value })}
              />
              <label className="label">Opis</label>
              <input
                className="input"
                value={weakness.note ?? ""}
                onChange={(e) => updateWeakness(weakness.id, { note: e.target.value })}
              />
              <div className="row-actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => removeWeakness(weakness.id)}
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="btn" onClick={addWeakness}>
          + Dodaj słabość
        </button>
      </div>

      <div className="field">
        <label className="label">Notatki</label>
        <textarea
          className="input"
          value={form.notes ?? ""}
          onChange={(e) => updateField("notes", e.target.value)}
        />
      </div>

      <h3 className="sectionTitle">Cechy</h3>
      <div className="list-rows">
        {(form.traits ?? []).map((trait) => (
          <div key={trait.id} className="list-row">
            <label className="label">Nazwa</label>
            <input
              className="input"
              value={trait.name}
              onChange={(e) => updateTrait(trait.id, { name: e.target.value })}
            />
            <label className="label">Opis</label>
            <input
              className="input"
              value={trait.note ?? ""}
              onChange={(e) => updateTrait(trait.id, { note: e.target.value })}
            />
            <div className="row-actions">
              <button type="button" className="btn btn--ghost" onClick={() => removeTrait(trait.id)}>
                Usuń
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="btn" onClick={addTrait}>
        + Dodaj cechę
      </button>

      <h3 className="sectionTitle">Akcje/Ataki</h3>
      <div className="list-rows">
        {(form.actions ?? []).map((action) => (
          <div key={action.id} className="list-row">
            <label className="label">Nazwa</label>
            <input
              className="input"
              value={action.name}
              onChange={(e) => updateAction(action.id, { name: e.target.value })}
            />
            <label className="label">Opis</label>
            <input
              className="input"
              value={action.note ?? ""}
              onChange={(e) => updateAction(action.id, { note: e.target.value })}
            />
            <div className="row-actions">
              <button type="button" className="btn btn--ghost" onClick={() => removeAction(action.id)}>
                Usuń
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="btn" onClick={addAction}>
        + Dodaj akcję
      </button>

      {form.legendary ? (
        <details className="panel" style={{ marginTop: 12 }}>
          <summary className="sectionTitle">Opcje legendarne</summary>
          <div className="field">
            <label className="label">Opis legendarny</label>
            <textarea
              className="input"
              value={form.legendaryDescription ?? ""}
              onChange={(e) => updateField("legendaryDescription", e.target.value)}
            />
          </div>

          <h3 className="sectionTitle">Ataki legendarne</h3>
          <div className="list-rows">
            {(form.legendaryAttacks ?? []).map((attack) => (
              <div key={attack.id} className="list-row">
                <label className="label">Nazwa</label>
                <input
                  className="input"
                  value={attack.name}
                  onChange={(e) => updateLegendaryAttack(attack.id, { name: e.target.value })}
                />
                <label className="label">Opis</label>
                <textarea
                  className="input"
                  value={attack.description ?? ""}
                  onChange={(e) =>
                    updateLegendaryAttack(attack.id, { description: e.target.value })
                  }
                />
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => removeLegendaryAttack(attack.id)}
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn" onClick={addLegendaryAttack}>
            + Dodaj atak legendarny
          </button>
        </details>
      ) : null}

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Anuluj
        </button>
        <button type="submit" className="btn btn--primary">
          Zapisz
        </button>
      </div>
    </form>
  );
}