import { useMemo, useState } from "react";
import type { Monster } from "../types/monster";
import { MonsterForm } from "./MonsterForm";
import { MonsterDetail } from "./MonsterDetail";

const crBuckets = [
  { id: "all", label: "CR: Wszystkie" },
  { id: "0-1", label: "CR 0-1" },
  { id: "2-4", label: "CR 2-4" },
  { id: "5-10", label: "CR 5-10" },
  { id: "11+", label: "CR 11+" }
];

const defaultMonster = (): Monster => ({
  id: `monster-${Date.now()}`,
  name: "Nowy potwór",
  type: "beast",
  cr: 1,
  hpMax: 10,
  ac: 12,
  speed: 30,
  size: "Medium",
  alignment: "Neutral",
  movement: { walk: true, fly: false, swim: false },
  traits: [],
  actions: [],
  weaknesses: "",
  notes: ""
});

type MonsterListViewProps = {
  monsters: Monster[];
  onUpsert: (monster: Monster) => void;
  onClose: () => void;
};

export function MonsterListView({ monsters, onUpsert, onClose }: MonsterListViewProps) {
  const [searchText, setSearchText] = useState("");
  const [crFilter, setCrFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState<Monster["size"] | "all">("all");
  const [alignmentFilter, setAlignmentFilter] = useState<string>("all");
  const [movementFilter, setMovementFilter] = useState({ walk: false, fly: false, swim: false });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const types = useMemo(() => Array.from(new Set(monsters.map((m) => m.type))), [monsters]);
  const sizes = useMemo(
    () => Array.from(new Set(monsters.map((m) => m.size))) as Monster["size"][],
    [monsters]
  );
  const alignments = useMemo(
    () => Array.from(new Set(monsters.map((m) => m.alignment))),
    [monsters]
  );

  const filtered = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    return monsters.filter((m) => {
      const matchesText =
        !text || m.name.toLowerCase().includes(text) || m.type.toLowerCase().includes(text);

      const matchesType = typeFilter === "all" || m.type === typeFilter;
      const matchesSize = sizeFilter === "all" || m.size === sizeFilter;
      const matchesAlignment = alignmentFilter === "all" || m.alignment === alignmentFilter;
      const matchesCr = (() => {
        switch (crFilter) {
          case "0-1":
            return m.cr <= 1;
          case "2-4":
            return m.cr >= 2 && m.cr <= 4;
          case "5-10":
            return m.cr >= 5 && m.cr <= 10;
          case "11+":
            return m.cr >= 11;
          default:
            return true;
        }
      })();
      const matchesMovement = (() => {
        const wantsWalk = movementFilter.walk;
        const wantsFly = movementFilter.fly;
        const wantsSwim = movementFilter.swim;
        if (!wantsWalk && !wantsFly && !wantsSwim) return true;
        return (
          (!wantsWalk || m.movement?.walk) &&
          (!wantsFly || m.movement?.fly) &&
          (!wantsSwim || m.movement?.swim)
        );
      })();
      return matchesText && matchesType && matchesCr && matchesSize && matchesAlignment && matchesMovement;
    });
  }, [monsters, searchText, crFilter, typeFilter, sizeFilter, alignmentFilter, movementFilter]);

  const selectedMonster = monsters.find((m) => m.id === selectedId) || null;

  const startCreate = () => {
    const monster = defaultMonster();
    setSelectedId(monster.id);
    setEditing(true);
  };

  const startEdit = (id: string) => {
    setSelectedId(id);
    setEditing(true);
  };

  const startView = (id: string) => {
    setSelectedId(id);
    setEditing(false);
  };

  const handleSave = (monster: Monster) => {
    onUpsert(monster);
    setSelectedId(monster.id);
    setEditing(false);
  };

  return (
    <div className="panel" style={{ margin: 12 }}>
      <div className="panel__header">
        <h2>Biblioteka potworów</h2>
        <div className="topbar__actions" style={{ gap: 8 }}>
          <button className="btn" onClick={startCreate}>
            Dodaj potwora
          </button>
          <button className="btn btn--ghost" onClick={onClose}>
            Zamknij
          </button>
        </div>
      </div>

      <div className="filter-row">
        <input
          className="input"
          placeholder="Szukaj po nazwie/typie"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select className="input" value={crFilter} onChange={(e) => setCrFilter(e.target.value)}>
          {crBuckets.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
        <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Typ: wszystkie</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value as Monster["size"] | "all")}
        >
          <option value="all">Rozmiar: wszystkie</option>
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={alignmentFilter}
          onChange={(e) => setAlignmentFilter(e.target.value)}
        >
          <option value="all">Charakter: wszystkie</option>
          {alignments.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={movementFilter.walk}
            onChange={() => setMovementFilter((prev) => ({ ...prev, walk: !prev.walk }))}
          />
          Chodzi
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={movementFilter.fly}
            onChange={() => setMovementFilter((prev) => ({ ...prev, fly: !prev.fly }))}
          />
          Lata
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={movementFilter.swim}
            onChange={() => setMovementFilter((prev) => ({ ...prev, swim: !prev.swim }))}
          />
          Pływa
        </label>
      </div>

      <div className="notes">
        {filtered.map((m) => (
          <article
            key={m.id}
            className={`note-card ${selectedId === m.id ? "scene-item--active" : ""}`}
            onClick={() => startView(m.id)}
          >
            <div className="pc-card__row">
              <span className="pc-card__name">{m.name}</span>
              <span className="pc-card__hp">CR {m.cr}</span>
            </div>
            <div className="pinned-card__detail">
              {m.type} • AC {m.ac} • HP {m.hpMax}
            </div>
            <div className="pinned-card__detail">
              {m.size} • {m.alignment}
            </div>
            <div className="row-actions">
              <button className="btn btn--ghost" onClick={() => startEdit(m.id)}>
                Edytuj
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedMonster ? (
        editing ? (
          <MonsterForm monster={selectedMonster} onSave={handleSave} onCancel={() => setEditing(false)} />
        ) : (
          <MonsterDetail monster={selectedMonster} onEdit={() => startEdit(selectedMonster.id)} />
        )
      ) : null}

      {editing && !selectedMonster ? (
        <MonsterForm monster={defaultMonster()} onSave={handleSave} onCancel={() => setEditing(false)} />
      ) : null}
    </div>
  );
}