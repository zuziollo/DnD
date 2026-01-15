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
      {monster.weaknesses ? <p className="pinned-card__detail">Słabości: {monster.weaknesses}</p> : null}
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