import { useMemo, useState } from "react";
import type { PlayerCharacter } from "../types/pc";
import type { NPC } from "../types/npc";
import type { Monster } from "../types/monster";
import type { Combatant, CombatLogEntry } from "../types/combat";

export type CombatViewProps = {
  combatants: Combatant[];
  combatLog: CombatLogEntry[];
  activeCombatantId: string;
  round: number;
  pcs: PlayerCharacter[];
  npcs: NPC[];
  monsters: Monster[];
  onAddPCs: (ids: string[]) => void;
  onAddNPCs: (ids: string[]) => void;
  onAddMonsters: (ids: string[]) => void;
  onAddAdHoc: (name: string, hpMax: number, ac: number) => void;
  onUpdateInitiative: (id: string, value: number) => void;
  onSortInitiative: () => void;
  onNextTurn: () => void;
  onDamage: (id: string, amount: number) => void;
  onHeal: (id: string, amount: number) => void;
  onAddCondition: (id: string, condition: string) => void;
  onRemoveCondition: (id: string, condition: string) => void;
  onUndo: () => void;
  onEndCombat: () => void;
};

export function CombatView({
  combatants,
  combatLog,
  activeCombatantId,
  round,
  pcs,
  npcs,
  monsters,
  onAddPCs,
  onAddNPCs,
  onAddMonsters,
  onAddAdHoc,
  onUpdateInitiative,
  onSortInitiative,
  onNextTurn,
  onDamage,
  onHeal,
  onAddCondition,
  onRemoveCondition,
  onUndo,
  onEndCombat
}: CombatViewProps) {
  const [selectedPCIds, setSelectedPCIds] = useState<string[]>([]);
  const [selectedNPCIds, setSelectedNPCIds] = useState<string[]>([]);
  const [adHocName, setAdHocName] = useState("");
  const [adHocHp, setAdHocHp] = useState(10);
  const [adHocAc, setAdHocAc] = useState(10);
  const [damageAmount, setDamageAmount] = useState(0);
  const [healAmount, setHealAmount] = useState(0);
  const [conditionText, setConditionText] = useState("");
  const [showPCPicker, setShowPCPicker] = useState(false);
  const [showNPCPicker, setShowNPCPicker] = useState(false);
  const [showMonsterPicker, setShowMonsterPicker] = useState(false);
  const [monsterSearch, setMonsterSearch] = useState("");
  const [monsterCrFilter, setMonsterCrFilter] = useState("ALL");

  const activeCombatant = useMemo(
    () => combatants.find((c) => c.id === activeCombatantId),
    [combatants, activeCombatantId]
  );

  const filteredMonsters = useMemo(() => {
    const search = monsterSearch.trim().toLowerCase();
    return monsters.filter((m) => {
      const matchesText =
        !search ||
        m.name.toLowerCase().includes(search) ||
        m.type.toLowerCase().includes(search);
      const matchesCr = (() => {
        if (monsterCrFilter === "ALL") return true;
        const value = m.cr ?? 0;
        if (monsterCrFilter === "0-1") return value >= 0 && value <= 1;
        if (monsterCrFilter === "2-4") return value >= 2 && value <= 4;
        if (monsterCrFilter === "5-10") return value >= 5 && value <= 10;
        if (monsterCrFilter === "11+") return value >= 11;
        return true;
      })();
      return matchesText && matchesCr;
    });
  }, [monsters, monsterCrFilter, monsterSearch]);

  const handleAddSelectedPCs = () => {
    onAddPCs(selectedPCIds);
    setSelectedPCIds([]);
    setShowPCPicker(false);
  };

  const handleAddSelectedNPCs = () => {
    onAddNPCs(selectedNPCIds);
    setSelectedNPCIds([]);
    setShowNPCPicker(false);
  };

  const movementLabel = (c: Combatant) => {
    switch (c.kind) {
      case "PC":
        return "PC";
      case "NPC":
        return "NPC";
      case "MONSTER":
        return "Potwór";
      default:
        return "Ad hoc";
    }
  };

  return (
    <>
      <div className="combat-layout">
      <aside className="panel panel--left">
        <div className="panel__header">
          <h2>Inicjatywa</h2>
          <button className="btn btn--ghost" onClick={onSortInitiative}>
            Sortuj wg inicjatywy
          </button>
        </div>
        <ul className="initiative-list">
          {combatants.map((entry) => (
            <li
              key={entry.id}
              className={`initiative-item ${
                entry.id === activeCombatantId ? "initiative-item--active" : ""
              }`}
            >
              <div className="initiative-item__name">{entry.name}</div>
              <div className="initiative-item__type">{movementLabel(entry)}</div>
              <input
                type="number"
                className="input input--inline"
                value={entry.initiative}
                onChange={(e) => onUpdateInitiative(entry.id, Number(e.target.value) || 0)}
                style={{ width: 70 }}
              />
            </li>
          ))}
          {combatants.length === 0 ? <li>Dodaj uczestników, aby rozpocząć.</li> : null}
        </ul>
        <div className="panel__section" style={{ gap: 8 }}>
          <div className="panel__header">
            <h3>Runda {round}</h3>
            <button className="btn" onClick={onNextTurn} disabled={!combatants.length}>
              Następna tura
            </button>
          </div>
        </div>
      </aside>

      <section className="panel panel--center">
        <div className="panel__section" style={{ gap: 12 }}>
          <h3>Dodaj uczestników</h3>
          <div className="pill-row">
            <button className="btn" onClick={() => setShowPCPicker((v) => !v)}>
              + PC
            </button>
            <button className="btn" onClick={() => setShowNPCPicker((v) => !v)}>
              + NPC
            </button>
            <button className="btn" onClick={() => setShowMonsterPicker(true)}>
              + Potwór
            </button>
          </div>
          {showPCPicker ? (
            <div className="picker-card">
              <div className="panel__header"><strong>Wybierz PC</strong></div>
              <div className="pill-row">
                {pcs.map((pc) => (
                  <label key={pc.id} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedPCIds.includes(pc.id)}
                      onChange={(e) =>
                        setSelectedPCIds((prev) =>
                          e.target.checked ? [...prev, pc.id] : prev.filter((id) => id !== pc.id)
                        )
                      }
                    />
                    {pc.name}
                  </label>
                ))}
                {!pcs.length ? <span className="muted">Brak PC</span> : null}
              </div>
              <div className="picker-actions">
                <button className="btn btn--ghost" onClick={handleAddSelectedPCs}>
                  Dodaj wybrane PC
                </button>
              </div>
            </div>
          ) : null}
          {showNPCPicker ? (
            <div className="picker-card">
              <div className="panel__header"><strong>Wybierz NPC</strong></div>
              <div className="pill-row">
                {npcs.map((npc) => (
                  <label key={npc.id} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedNPCIds.includes(npc.id)}
                      onChange={(e) =>
                        setSelectedNPCIds((prev) =>
                          e.target.checked ? [...prev, npc.id] : prev.filter((id) => id !== npc.id)
                        )
                      }
                    />
                    {npc.name}
                  </label>
                ))}
                {!npcs.length ? <span className="muted">Brak NPC</span> : null}
              </div>
              <div className="picker-actions">
                <button className="btn btn--ghost" onClick={handleAddSelectedNPCs}>
                  Dodaj wybrane NPC
                </button>
              </div>
            </div>
          ) : null}
          <div className="panel__section">
            <div className="panel__header"><strong>Ad hoc</strong></div>
            <div className="field">
              <label className="label">Nazwa</label>
              <input
                className="input"
                value={adHocName}
                onChange={(e) => setAdHocName(e.target.value)}
                placeholder="Bandzior"
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label className="label">HP</label>
                <input
                  type="number"
                  className="input"
                  value={adHocHp}
                  onChange={(e) => setAdHocHp(Number(e.target.value) || 0)}
                />
              </div>
              <div className="field">
                <label className="label">AC</label>
                <input
                  type="number"
                  className="input"
                  value={adHocAc}
                  onChange={(e) => setAdHocAc(Number(e.target.value) || 0)}
                />
              </div>
            </div>
            <button
              className="btn"
              onClick={() => {
                onAddAdHoc(adHocName, adHocHp, adHocAc);
                setAdHocName("");
              }}
            >
              Dodaj ad hoc
            </button>
          </div>
        </div>

        <div className="panel__section">
          <div className="panel__header">
            <h2>Aktywna tura</h2>
            <div className="combat-actions">
              <button className="btn btn--ghost" onClick={onUndo}>
                Undo
              </button>
              <button className="btn" onClick={onNextTurn} disabled={!combatants.length}>
                Następna tura
              </button>
              <button className="btn btn--primary" onClick={onEndCombat}>
                Zakończ walkę
              </button>
            </div>
          </div>
          {activeCombatant ? (
            <div className="active-card">
              <div className="active-card__header">
                <div>
                  <div className="active-card__name">{activeCombatant.name}</div>
                  <div className="muted">
                    {movementLabel(activeCombatant)} • HP {activeCombatant.hpCurrent}/{activeCombatant.hpMax} • AC {" "}
                    {activeCombatant.ac}
                  </div>
                </div>
                <div className="pill pill--tag">Initiative {activeCombatant.initiative}</div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="label">Obrażenia</label>
                  <div className="field-row">
                    <input
                      type="number"
                      className="input"
                      value={damageAmount}
                      onChange={(e) => setDamageAmount(Number(e.target.value) || 0)}
                    />
                    <button className="btn" onClick={() => onDamage(activeCombatant.id, damageAmount)}>
                      Zadaj
                    </button>
                  </div>
                </div>
                <div className="field">
                  <label className="label">Leczenie</label>
                  <div className="field-row">
                    <input
                      type="number"
                      className="input"
                      value={healAmount}
                      onChange={(e) => setHealAmount(Number(e.target.value) || 0)}
                    />
                    <button className="btn" onClick={() => onHeal(activeCombatant.id, healAmount)}>
                      Ulecz
                    </button>
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="label">Stany</label>
                <div className="pill-row">
                  {activeCombatant.conditions.map((cond: string) => (
                    <span key={cond} className="pill pill--tag">
                      {cond}
                      <button
                        className="pill__close"
                        onClick={() => onRemoveCondition(activeCombatant.id, cond)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="field-row">
                  <input
                    className="input"
                    value={conditionText}
                    onChange={(e) => setConditionText(e.target.value)}
                    placeholder="np. Spowolniony"
                  />
                  <button
                    className="btn btn--ghost"
                    onClick={() => {
                      onAddCondition(activeCombatant.id, conditionText);
                      setConditionText("");
                    }}
                  >
                    Dodaj stan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="muted">Brak aktywnego uczestnika.</div>
          )}
        </div>

        <div className="panel__section">
          <div className="panel__header">
            <h2>Log walki</h2>
          </div>
          <ul className="log">
            {combatLog.map((entry) => (
              <li key={entry.id} className="log__item">
                <div className="muted" style={{ fontSize: 12 }}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
                <div>{entry.message}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <aside className="panel panel--right">
        <div className="panel__header">
          <h2>Uczestnicy</h2>
        </div>
        <ul className="pc-list">
          {combatants.map((p) => (
            <li key={p.id} className={`pc-card ${p.id === activeCombatantId ? "pc-card--active" : ""}`}>
              <div className="pc-card__row">
                <span className="pc-card__name">{p.name}</span>
                <span className="pc-card__hp">HP: {p.hpCurrent}/{p.hpMax}</span>
              </div>
              <div className="pc-card__row">
                <span>AC: {p.ac}</span>
                <span className="pill pill--tag">{movementLabel(p)}</span>
              </div>
              {p.conditions.length ? (
                <div className="pill-row">
                  {p.conditions.map((cond: string) => (
                    <span key={cond} className="pill pill--tag">
                      {cond}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </aside>
    </div>

      {showMonsterPicker ? (
        <div className="modal-backdrop">
          <div className="modal">
          <div className="panel__header">
            <h3>Wybierz potwora</h3>
            <button className="btn btn--ghost" onClick={() => setShowMonsterPicker(false)}>
              Zamknij
            </button>
          </div>
          <div className="field">
            <label className="label">Szukaj (nazwa/typ)</label>
            <input
              className="input"
              value={monsterSearch}
              onChange={(e) => setMonsterSearch(e.target.value)}
              placeholder="np. Goblin"
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label className="label">CR</label>
              <select
                className="input"
                value={monsterCrFilter}
                onChange={(e) => setMonsterCrFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="0-1">0-1</option>
                <option value="2-4">2-4</option>
                <option value="5-10">5-10</option>
                <option value="11+">11+</option>
              </select>
            </div>
          </div>
          <ul className="modal__list">
            {filteredMonsters.map((m) => (
              <li key={m.id} className="modal__item">
                <div className="modal__item-main">
                  <div className="modal__item-title">{m.name}</div>
                  <div className="muted">
                    {m.type} • CR {m.cr} • HP {m.hpMax} • AC {m.ac}
                  </div>
                  <div className="muted">
                    Rozmiar: {m.size} • Ruch: {[
                      m.movement?.walk ? "chodzi" : null,
                      m.movement?.fly ? "lata" : null,
                      m.movement?.swim ? "pływa" : null
                    ]
                      .filter(Boolean)
                      .join(", ") || "brak"}
                  </div>
                </div>
                <button className="btn" onClick={() => onAddMonsters([m.id])}>
                  Dodaj
                </button>
              </li>
            ))}
            {!filteredMonsters.length ? (
              <li className="muted">Brak potworów w filtrze.</li>
            ) : null}
          </ul>
        </div>
      </div>
    ) : null}
    </>
  );
}