import React, { useMemo, useState } from "react";
import { PCDetail } from "./PCDetail";
import { PCForm } from "./PCForm";
import type { PlayerCharacter } from "../types/pc";

type PCListViewProps = {
  pcs: PlayerCharacter[];
  onClose: () => void;
  onUpsert: (pc: PlayerCharacter) => void;
};

export function PCListView({ pcs, onClose, onUpsert }: PCListViewProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(pcs[0]?.id ?? null);
  const [showForm, setShowForm] = useState(false);
  const [editPc, setEditPc] = useState<PlayerCharacter | undefined>(undefined);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pcs;
    return pcs.filter((pc) => pc.name.toLowerCase().includes(term));
  }, [pcs, search]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setShowForm(false);
  };

  const handleCreate = () => {
    setEditPc(undefined);
    setShowForm(true);
  };

  const handleEdit = (pc: PlayerCharacter) => {
    setEditPc(pc);
    setShowForm(true);
  };

  const selected = filtered.find((p) => p.id === selectedId) || filtered[0];

  return (
    <div className="layout" style={{ gridTemplateColumns: "320px 1fr" }}>
      <aside className="panel panel--left">
        <div className="panel__header">
          <h2 className="panel__title">Biblioteka PC</h2>
          <button className="btn btn--ghost" onClick={onClose}>
            Zamknij
          </button>
        </div>
        <input
          className="input"
          placeholder="Szukaj po nazwie"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <button className="btn" onClick={handleCreate} style={{ marginTop: 8 }}>
          Nowa postać
        </button>
        <ul className="scene-list" style={{ marginTop: 12 }}>
          {filtered.map((pc) => (
            <li
              key={pc.id}
              className={`scene-item ${pc.id === selected?.id ? "scene-item--active" : ""}`}
              onClick={() => handleSelect(pc.id)}
            >
              <div>
                <div className="scene-item__title">{pc.name}</div>
                <div className="scene-item__status">
                  {pc.className} / lvl {pc.level}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div>HP {pc.hpCurrent}/{pc.hpMax}</div>
                <div>AC {pc.ac}</div>
                <button className="btn btn--ghost" onClick={() => handleEdit(pc)}>
                  Edytuj
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 ? <li>Brak postaci</li> : null}
        </ul>
      </aside>

      <section className="panel panel--center">
        {showForm ? (
          <PCForm
            initial={editPc}
            onSubmit={(pc) => {
              onUpsert(pc);
              setShowForm(false);
              setSelectedId(pc.id);
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : selected ? (
          <PCDetail
            pc={selected}
            onUpdate={(id, patch) => {
              onUpsert({ ...selected, ...patch, id });
            }}
            onSaveFull={(full) => {
              onUpsert(full);
              setSelectedId(full.id);
            }}
          />
        ) : (
          <div style={{ padding: 16 }}>Wybierz postać z listy lub dodaj nową.</div>
        )}
      </section>
    </div>
  );
}