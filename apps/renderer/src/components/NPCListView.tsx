import React, { useMemo, useState } from "react";
import type { NPC } from "../types/npc";
import { NPCDetail } from "./NPCDetail";
import { NPCForm } from "./NPCForm";

type NPCListViewProps = {
  npcs: NPC[];
  onClose: () => void;
  onUpsert: (npc: NPC) => void;
};

export function NPCListView({ npcs, onClose, onUpsert }: NPCListViewProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(npcs[0]?.id ?? null);
  const [showForm, setShowForm] = useState(false);
  const [editNpc, setEditNpc] = useState<NPC | undefined>(undefined);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return npcs;
    return npcs.filter((npc) =>
      [npc.name, npc.role, npc.faction, ...(npc.tags ?? [])]
        .filter(Boolean)
        .some((val) => (val as string).toLowerCase().includes(term))
    );
  }, [npcs, search]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setShowForm(false);
  };

  const handleCreate = () => {
    setEditNpc(undefined);
    setShowForm(true);
  };

  const handleEdit = (npc: NPC) => {
    setEditNpc(npc);
    setShowForm(true);
  };

  const handleUpsert = (updated: NPC) => {
    onUpsert(updated);
    setShowForm(false);
    setSelectedId(updated.id);
  };

  const selected = filtered.find((n) => n.id === selectedId) || filtered[0];

  return (
    <div className="layout" style={{ gridTemplateColumns: "320px 1fr" }}>
      <aside className="panel panel--left">
        <div className="panel__header">
          <h2 className="panel__title">Biblioteka NPC</h2>
          <button className="btn btn--ghost" onClick={onClose}>
            Zamknij
          </button>
        </div>
        <input
          className="input"
          placeholder="Szukaj po nazwie/roli"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <button className="btn" onClick={handleCreate} style={{ marginTop: 8 }}>
          Nowy NPC
        </button>
        <ul className="scene-list" style={{ marginTop: 12 }}>
          {filtered.map((npc: NPC) => (
            <li
              key={npc.id}
              className={`scene-item ${npc.id === selected?.id ? "scene-item--active" : ""}`}
              onClick={() => handleSelect(npc.id)}
            >
              <div>
                <div className="scene-item__title">{npc.name}</div>
                <div className="scene-item__status">{npc.role || "brak roli"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div>HP {npc.hpCurrent ?? 0}/{npc.hpMax ?? 0}</div>
                <div>AC {npc.ac ?? "-"}</div>
                <button className="btn btn--ghost" onClick={() => handleEdit(npc)}>
                  Edytuj
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 ? <li>Brak NPC</li> : null}
        </ul>
      </aside>

      <section className="panel panel--center">
        {showForm ? (
          <NPCForm initial={editNpc} onSubmit={handleUpsert} onCancel={() => setShowForm(false)} />
        ) : selected ? (
          <NPCDetail npc={selected} onUpdate={handleUpsert} />
        ) : (
          <div style={{ padding: 16 }}>Wybierz NPC z listy lub dodaj nowego.</div>
        )}
      </section>
    </div>
  );
}