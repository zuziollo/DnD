import type { Monster } from "../types/monster";

type MonsterDetailProps = {
  monster: Monster;
  onEdit: () => void;
};

export function MonsterDetail({ monster, onEdit }: MonsterDetailProps) {
  const movement = [
    monster.movement?.walk !== false ? "chodzi" : null,
    monster.movement?.fly ? "lata" : null,
    monster.movement?.swim ? "pływa" : null
  ].filter(Boolean);
  type MonsterAbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
  const abilityFields: { key: MonsterAbilityKey; label: string }[] = [
    { key: "str", label: "Siła (STR)" },
    { key: "dex", label: "Zręczność (DEX)" },
    { key: "con", label: "Kondycja (CON)" },
    { key: "int", label: "Inteligencja (INT)" },
    { key: "wis", label: "Mądrość (WIS)" },
    { key: "cha", label: "Charyzma (CHA)" }
  ];

  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <div className="panel__header">
        <h3>{monster.name}</h3>
        <button className="btn" onClick={onEdit}>
          Edytuj
        </button>
      </div>
      <div className="pinned-card__detail">{monster.type} • CR {monster.cr}</div>
      <div className="pinned-card__detail">Rozmiar: {monster.size}</div>
      <div className="pinned-card__detail">Charakter: {monster.alignment}</div>
      <div className="pc-card__row">
        <span>HP: {monster.hpMax}</span>
        <span>AC: {monster.ac}</span>
        <span>Szybkość: {monster.speed}</span>
      </div>
      {movement.length ? (
        <div className="pinned-card__detail">Ruch: {movement.join(", ")}</div>
      ) : null}
      {monster.languages?.length ? (
        <div className="pinned-card__detail">Języki: {monster.languages.join(", ")}</div>
      ) : null}
      {monster.legendary ? (
        <div className="panel__section">
          <h4>Legendarny</h4>
          {monster.legendaryDescription ? (
            <p className="muted">{monster.legendaryDescription}</p>
          ) : null}
          {monster.legendaryAttacks?.length ? (
            <div>
              <strong>Ataki legendarne</strong>
              <ul className="log">
                {monster.legendaryAttacks.map((attack) => (
                  <li key={attack.id} className="log__item">
                    <strong>{attack.name}</strong>
                    {attack.description ? <span> — {attack.description}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="panel__section">
        <h4>Atrybuty</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {abilityFields.map(({ key, label }) => (
            <div key={String(key)} className="form-field">
              <span>{label}</span>
              <div className="pill pill--tag">{monster[key] ?? 10}</div>
            </div>
          ))}
        </div>
      </div>
      {monster.weaknesses && monster.weaknesses.length ? (
        <div className="panel__section">
          <h4>Słabości</h4>
          <ul className="log">
            {monster.weaknesses.map((weakness) => (
              <li key={weakness.id} className="log__item">
                <strong>{weakness.name}</strong>
                {weakness.note ? <span> — {weakness.note}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {monster.notes ? <p className="pinned-card__detail">Notatki: {monster.notes}</p> : null}

      {monster.traits && monster.traits.length ? (
        <div className="panel__section">
          <h4>Cechy</h4>
          <ul className="log">
            {monster.traits.map((t) => (
              <li key={t.id} className="log__item">
                <strong>{t.name}</strong>
                {t.note ? <span> — {t.note}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {monster.actions && monster.actions.length ? (
        <div className="panel__section">
          <h4>Akcje</h4>
          <ul className="log">
            {monster.actions.map((a) => (
              <li key={a.id} className="log__item">
                <strong>{a.name}</strong>
                {a.note ? <span> — {a.note}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}