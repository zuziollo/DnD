import { PlayerCharacter } from "../types/pc";
import { NPC } from "../types/npc";

type RightPanelProps = {
  pcs: PlayerCharacter[];
  npcs: NPC[];
  pinnedNpcIds: string[];
  onPinNpc: (id: string) => void;
  onUnpinNpc: (id: string) => void;
  onOpenPCs: () => void;
  onUpdatePC: (id: string, patch: Partial<PlayerCharacter>) => void;
  onOpenNPCs: () => void;
};

export function RightPanel({
  pcs,
  npcs,
  pinnedNpcIds,
  onPinNpc,
  onUnpinNpc,
  onOpenPCs,
  onUpdatePC,
  onOpenNPCs
}: RightPanelProps) {
  const pinnedNPCs = npcs.filter((npc) => pinnedNpcIds.includes(npc.id));
  const firstNpcId = npcs[0]?.id ?? "";

  return (
    <aside className="panel panel--right">
      <div className="panel__section">
        <div className="panel__header">
          <h2>Postacie Graczy</h2>
          <button className="btn btn--ghost" onClick={onOpenPCs}>
            Otwórz karty
          </button>
        </div>
        <ul className="pc-list">
          {pcs.map((pc) => (
            <li key={pc.id} className="pc-card">
              <div className="pc-card__row">
                <span className="pc-card__name">{pc.name}</span>
                <span className="pc-card__hp">
                  HP:
                  <input
                    className="input input--inline"
                    type="number"
                    value={pc.hpCurrent}
                    onChange={(e) =>
                      onUpdatePC(pc.id, {
                        hpCurrent: Number(e.target.value) || 0
                      })
                    }
                    style={{ width: 64, marginLeft: 6 }}
                  />
                  /{pc.hpMax}
                </span>
              </div>
              <div className="pc-card__row">
                <span>AC: {pc.ac}</span>
                {pc.conditions?.length ? (
                  <span className="pill pill--tag">{pc.conditions.join(", ")}</span>
                ) : null}
              </div>
            </li>
          ))}
          {pcs.length === 0 ? <li>Brak postaci — dodaj w Bibliotece PC.</li> : null}
        </ul>
      </div>

      <div className="panel__section">
        <div className="panel__header">
          <h2>Przypięte NPC / Lokacje</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={onOpenNPCs}>
              Biblioteka NPC
            </button>
            <select
              className="input"
              value={firstNpcId}
              onChange={(e) => onPinNpc(e.target.value)}
              style={{ minWidth: 120 }}
              disabled={!npcs.length}
            >
              {npcs.map((npc) => (
                <option key={npc.id} value={npc.id}>
                  {npc.name}
                </option>
              ))}
            </select>
            <button
              className="btn btn--ghost"
              onClick={() => onPinNpc(firstNpcId)}
              disabled={!firstNpcId}
            >
              Przypnij NPC
            </button>
          </div>
        </div>
        <ul className="pinned-list">
          {pinnedNPCs.map((npc) => (
            <li key={npc.id} className="pinned-card">
              <div className="pinned-card__title">{npc.name}</div>
              <div className="pinned-card__detail">{npc.role}</div>
              <div className="pc-card__row">
                <span>HP {npc.hpCurrent ?? 0}/{npc.hpMax ?? 0}</span>
                <span>AC {npc.ac ?? "-"}</span>
              </div>
              <button className="btn btn--ghost" onClick={() => onUnpinNpc(npc.id)}>
                Odepnij
              </button>
            </li>
          ))}
          {pinnedNPCs.length === 0 ? <li>Brak przypiętych NPC</li> : null}
        </ul>
      </div>
    </aside>
  );
}