import { useEffect, useMemo, useState } from "react";
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
  onDamage: (actorId: string, targetId: string, amount: number) => void;
  onHeal: (actorId: string, targetId: string, amount: number) => void;
  onAddCondition: (actorId: string, targetId: string, condition: string) => void;
  onRemoveCondition: (actorId: string, targetId: string, condition: string) => void;
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
  const [detailConditionText, setDetailConditionText] = useState("");
  const [showPCPicker, setShowPCPicker] = useState(false);
  const [showNPCPicker, setShowNPCPicker] = useState(false);
  const [showMonsterPicker, setShowMonsterPicker] = useState(false);
  const [monsterSearch, setMonsterSearch] = useState("");
  const [monsterCrFilter, setMonsterCrFilter] = useState("ALL");
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [targetError, setTargetError] = useState("");
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [selectedCombatantId, setSelectedCombatantId] = useState<string | null>(null);

  const activeCombatant = useMemo(
    () => combatants.find((c) => c.id === activeCombatantId),
    [combatants, activeCombatantId]
  );

  const selectedTarget = useMemo(
    () => combatants.find((c) => c.id === selectedTargetId) ?? null,
    [combatants, selectedTargetId]
  );

  const selectedCombatant = useMemo(
    () => combatants.find((c) => c.id === selectedCombatantId) ?? null,
    [combatants, selectedCombatantId]
  );

  const selectedPc = useMemo(
    () => pcs.find((pc) => pc.id === selectedCombatant?.sourceId),
    [pcs, selectedCombatant]
  );

  const selectedNpc = useMemo(
    () => npcs.find((npc) => npc.id === selectedCombatant?.sourceId),
    [npcs, selectedCombatant]
  );

  const selectedMonster = useMemo(
    () =>
      monsters.find(
        (monster) =>
          monster.id === selectedCombatant?.sourceId || monster.id === selectedCombatant?.id
      ),
    [monsters, selectedCombatant]
  );

  useEffect(() => {
    if (activeCombatantId && combatants.some((c) => c.id === activeCombatantId)) {
      setSelectedTargetId(activeCombatantId);
      setTargetError("");
      return;
    }
    if (combatants.length) {
      setSelectedTargetId(combatants[0].id);
      setTargetError("");
    } else {
      setSelectedTargetId(null);
      setTargetError("");
    }
  }, [activeCombatantId, combatants]);

  useEffect(() => {
    if (activeCombatantId && combatants.some((c) => c.id === activeCombatantId)) {
      setSelectedCombatantId(activeCombatantId);
      return;
    }
    if (combatants.length) {
      setSelectedCombatantId(combatants[0].id);
    } else {
      setSelectedCombatantId(null);
    }
  }, [activeCombatantId, combatants]);

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
          <button
            className="btn btn--ghost"
            onClick={() => setIsAddPanelOpen((prev) => !prev)}
          >
            Dodaj uczestników {isAddPanelOpen ? "▲" : "▼"}
          </button>
          {isAddPanelOpen ? (
            <>
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
                  <div className="panel__header">
                    <strong>Wybierz PC</strong>
                  </div>
                  <div className="pill-row">
                    {pcs.map((pc) => (
                      <label key={pc.id} className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={selectedPCIds.includes(pc.id)}
                          onChange={(e) =>
                            setSelectedPCIds((prev) =>
                              e.target.checked
                                ? [...prev, pc.id]
                                : prev.filter((id) => id !== pc.id)
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
                  <div className="panel__header">
                    <strong>Wybierz NPC</strong>
                  </div>
                  <div className="pill-row">
                    {npcs.map((npc) => (
                      <label key={npc.id} className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={selectedNPCIds.includes(npc.id)}
                          onChange={(e) =>
                            setSelectedNPCIds((prev) =>
                              e.target.checked
                                ? [...prev, npc.id]
                                : prev.filter((id) => id !== npc.id)
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
                <div className="panel__header">
                  <strong>Ad hoc</strong>
                </div>
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
            </>
          ) : null}
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
                  <label className="label">Cel</label>
                  <select
                    className="input"
                    value={selectedTargetId ?? ""}
                    onChange={(e) => {
                      setSelectedTargetId(e.target.value || null);
                      setTargetError("");
                    }}
                    disabled={!combatants.length}
                  >
                    {combatants.map((combatant) => (
                      <option key={combatant.id} value={combatant.id}>
                        {combatant.name} (HP {combatant.hpCurrent}/{combatant.hpMax})
                      </option>
                    ))}
                  </select>
                  {targetError ? <div className="muted">{targetError}</div> : null}
                </div>
                <div className="field">
                  <label className="label">Obrażenia</label>
                  <div className="field-row">
                    <input
                      type="number"
                      className="input"
                      value={damageAmount}
                      onChange={(e) => setDamageAmount(Number(e.target.value) || 0)}
                    />
                    <button
                      className="btn"
                      onClick={() => {
                        if (!selectedTargetId) {
                          setTargetError("Wybierz cel.");
                          return;
                        }
                        onDamage(activeCombatant.id, selectedTargetId, damageAmount);
                      }}
                    >
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
                    <button
                      className="btn"
                      onClick={() => {
                        if (!selectedTargetId) {
                          setTargetError("Wybierz cel.");
                          return;
                        }
                        onHeal(activeCombatant.id, selectedTargetId, healAmount);
                      }}
                    >
                      Ulecz
                    </button>
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="label">Stany (cel)</label>
                <div className="pill-row">
                  {selectedTarget?.conditions.map((cond: string) => (
                    <span key={cond} className="pill pill--tag">
                      {cond}
                      <button
                        className="pill__close"
                        onClick={() => {
                          if (!selectedTargetId) {
                            setTargetError("Wybierz cel.");
                            return;
                          }
                          onRemoveCondition(activeCombatant.id, selectedTargetId, cond);
                        }}
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
                      if (!selectedTargetId) {
                        setTargetError("Wybierz cel.");
                        return;
                      }
                      onAddCondition(activeCombatant.id, selectedTargetId, conditionText);
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

      <aside className="panel panel--right combat-participants-panel">
        <div className="panel__header">
          <h2>Uczestnicy</h2>
        </div>
        <ul className="pc-list">
          {combatants.map((p) => (
            <li
              key={p.id}
              className={`pc-card ${
                p.id === activeCombatantId ? "pc-card--active" : ""
              } ${p.id === selectedCombatantId ? "pc-card--selected" : ""}`}
              onClick={() => setSelectedCombatantId(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedCombatantId(p.id);
                }
              }}
            >
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
      <aside className="panel panel--right combat-detail-panel">
        <div className="panel__header">
          <h2>Szczegóły</h2>
        </div>
        {selectedCombatant ? (
          <div className="detail-card">
            <div className="detail-card__header">
              <div className="detail-card__name">{selectedCombatant.name}</div>
              <div className="muted">
                {movementLabel(selectedCombatant)} • HP {selectedCombatant.hpCurrent}/
                {selectedCombatant.hpMax} • AC {selectedCombatant.ac}
              </div>
            </div>
            {selectedCombatant.kind === "PC" && selectedPc ? (
              <div className="detail-card__section">
                <div className="muted">
                  {selectedPc.className} {selectedPc.level ? `• poziom ${selectedPc.level}` : ""}
                </div>
                <div className="muted">Szybkość: {selectedPc.speed}</div>
                {selectedPc.features.length ? (
                  <div>
                    <strong>Cechy</strong>
                    <ul className="detail-list">
                      {selectedPc.features.map((feature) => (
                        <li key={feature.id}>{feature.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {selectedPc.skills?.length ? (
                  <div>
                    <strong>Umiejętności</strong>
                    <ul className="detail-list">
                      {selectedPc.skills.map((skill) => (
                        <li key={skill.id}>
                          {skill.name} {skill.value ?? ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {selectedPc.inventory.length ? (
                  <div>
                    <strong>Ekwipunek</strong>
                    <ul className="detail-list">
                      {selectedPc.inventory.map((item) => (
                        <li key={item.id}>
                          {item.name} × {item.qty}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {selectedPc.spells.length ? (
                  <div>
                    <strong>Czary</strong>
                    <ul className="detail-list">
                      {selectedPc.spells.map((spell) => (
                        <li key={spell.id}>{spell.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
            {selectedCombatant.kind === "NPC" && selectedNpc ? (
              <div className="detail-card__section">
                <div className="muted">{selectedNpc.role}</div>
                <div className="muted">
                  {selectedNpc.hpCurrent}/{selectedNpc.hpMax} HP • AC {selectedNpc.ac}
                </div>
                {selectedNpc.attacks?.length ? (
                  <div>
                    <strong>Ataki</strong>
                    <ul className="detail-list">
                      {selectedNpc.attacks.map((attack) => (
                        <li key={attack.id}>{attack.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {selectedNpc.dmNotes ? (
                  <div>
                    <strong>Notatki MG</strong>
                    <div className="muted">{selectedNpc.dmNotes}</div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {selectedCombatant.kind === "MONSTER" && selectedMonster ? (
              <div className="detail-card__section">
                <div className="muted">
                  {selectedMonster.type} • CR {selectedMonster.cr}
                </div>
                <div className="muted">
                  Rozmiar: {selectedMonster.size} • Charakter: {selectedMonster.alignment}
                </div>
                <div className="muted">
                  Ruch:{" "}
                  {[
                    selectedMonster.movement?.walk ? "chodzi" : null,
                    selectedMonster.movement?.fly ? "lata" : null,
                    selectedMonster.movement?.swim ? "pływa" : null
                  ]
                    .filter(Boolean)
                    .join(", ") || "brak"}
                </div>
                {selectedMonster.traits.length ? (
                  <div>
                    <strong>Traits</strong>
                    <ul className="detail-list">
                      {selectedMonster.traits.map((trait) => (
                        <li key={trait.id}>{trait.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {selectedMonster.actions.length ? (
                  <div>
                    <strong>Akcje</strong>
                    <ul className="detail-list">
                      {selectedMonster.actions.map((action) => (
                        <li key={action.id}>{action.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {selectedMonster.weaknesses ? (
                  <div>
                    <strong>Słabości</strong>
                    <div className="muted">{selectedMonster.weaknesses}</div>
                  </div>
                ) : null}
                {selectedMonster.notes ? (
                  <div>
                    <strong>Opis</strong>
                    <div className="muted">{selectedMonster.notes}</div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {selectedCombatant.kind === "ADHOC" ? (
              <div className="detail-card__section">
                <div className="muted">Uczestnik ad hoc</div>
              </div>
            ) : null}
            <div className="detail-card__section">
              <strong>Stany</strong>
              <div className="pill-row">
                {selectedCombatant.conditions.map((cond: string) => (
                  <span key={cond} className="pill pill--tag">
                    {cond}
                    <button
                      className="pill__close"
                      onClick={() => {
                        if (!activeCombatantId) return;
                        onRemoveCondition(activeCombatantId, selectedCombatant.id, cond);
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="field-row">
                <input
                  className="input"
                  value={detailConditionText}
                  onChange={(e) => setDetailConditionText(e.target.value)}
                  placeholder="Dodaj stan"
                />
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    if (!activeCombatantId || !detailConditionText.trim()) return;
                    onAddCondition(activeCombatantId, selectedCombatant.id, detailConditionText);
                    setDetailConditionText("");
                  }}
                >
                  Dodaj
                </button>
              </div>
              <div className="pill-row">
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    if (!activeCombatantId) return;
                    onDamage(activeCombatantId, selectedCombatant.id, 5);
                  }}
                >
                  +5 dmg
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    if (!activeCombatantId) return;
                    onHeal(activeCombatantId, selectedCombatant.id, 5);
                  }}
                >
                  +5 heal
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="muted">Wybierz uczestnika z listy.</div>
        )}
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