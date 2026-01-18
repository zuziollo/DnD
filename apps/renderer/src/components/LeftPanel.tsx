import { useState } from "react";

type Scene = {
  id: string;
  title: string;
  description?: string;
  status: "UPCOMING" | "ACTIVE" | "DONE";
  order: number;
};

type SceneFormState = {
  title: string;
  description: string;
  status: Scene["status"];
};

type LeftPanelProps = {
  scenes: Scene[];
  activeSceneId: string | null;
  onSetActive: (id: string) => void;
  onAddScene: (scene: Omit<Scene, "id" | "order">) => void;
  onUpdateScene: (id: string, patch: Partial<Omit<Scene, "id" | "order">>) => void;
  onDeleteScene: (id: string) => void;
  onMoveScene: (id: string, direction: "up" | "down") => void;
};

export function LeftPanel({
  scenes,
  activeSceneId,
  onSetActive,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
  onMoveScene
}: LeftPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [formState, setFormState] = useState<SceneFormState>({
    title: "",
    description: "",
    status: "UPCOMING"
  });

  const sortedScenes = [...scenes].sort((a, b) => a.order - b.order);

  const beginAdd = () => {
    setFormState({ title: "", description: "", status: "UPCOMING" });
    setIsAdding(true);
    setEditingSceneId(null);
  };

  const beginEdit = (scene: Scene) => {
    setFormState({
      title: scene.title,
      description: scene.description ?? "",
      status: scene.status
    });
    setEditingSceneId(scene.id);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!formState.title.trim()) return;
    if (editingSceneId) {
      onUpdateScene(editingSceneId, {
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        status: formState.status
      });
      setEditingSceneId(null);
    } else {
      onAddScene({
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        status: formState.status
      });
      setIsAdding(false);
    }
    setFormState({ title: "", description: "", status: "UPCOMING" });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Usunąć scenę?")) return;
    onDeleteScene(id);
    if (editingSceneId === id) {
      setEditingSceneId(null);
    }
  };

  return (
    <aside className="panel panel--left">
      <div className="panel__header">
        <h2 className="panel__title">Agenda / Sceny</h2>
        <button className="btn btn--ghost" onClick={beginAdd}>
          + Dodaj scenę
        </button>
      </div>
      <ul className="scene-list">
        {sortedScenes.map((scene, index) => (
          <li
            key={scene.id}
            className={`scene-item ${scene.id === activeSceneId ? "scene-item--active" : ""}`}
            onClick={() => {
              console.log("[LeftPanel] click scene", scene.id);
              onSetActive(scene.id);
            }}
          >
            {editingSceneId === scene.id ? (
              <div className="scene-form" onClick={(e) => e.stopPropagation()}>
                <label className="label">Tytuł</label>
                <input
                  className="input"
                  value={formState.title}
                  onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                />
                <label className="label">Opis</label>
                <input
                  className="input"
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
                <label className="label">Status</label>
                <select
                  className="input"
                  value={formState.status}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      status: e.target.value as Scene["status"]
                    }))
                  }
                >
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DONE">DONE</option>
                </select>
                <div className="scene-form__actions">
                  <button
                    className="btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave();
                    }}
                  >
                    Zapisz
                  </button>
                  <button
                    className="btn btn--ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSceneId(null);
                    }}
                  >
                    Anuluj
                  </button>
                  <button
                    className="btn btn--ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(scene.id);
                    }}
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="scene-item__title">{scene.title}</div>
                  {scene.description ? (
                    <div className="scene-item__description">{scene.description}</div>
                  ) : null}
                </div>
                <div className="scene-item__meta">
                  <span className="scene-item__status">{scene.status}</span>
                  <div className="scene-item__actions">
                    <button
                      className="btn btn--ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveScene(scene.id, "up");
                      }}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      className="btn btn--ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveScene(scene.id, "down");
                      }}
                      disabled={index === sortedScenes.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      className="btn btn--ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        beginEdit(scene);
                      }}
                    >
                      Edytuj
                    </button>
                  </div>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {isAdding ? (
        <div className="scene-form" onClick={(e) => e.stopPropagation()}>
          <label className="label">Tytuł</label>
          <input
            className="input"
            value={formState.title}
            onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
          />
          <label className="label">Opis</label>
          <input
            className="input"
            value={formState.description}
            onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
          />
          <label className="label">Status</label>
          <select
            className="input"
            value={formState.status}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                status: e.target.value as Scene["status"]
              }))
            }
          >
            <option value="UPCOMING">UPCOMING</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DONE">DONE</option>
          </select>
          <div className="scene-form__actions">
            <button className="btn" onClick={handleSave}>
              Dodaj
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => {
                setIsAdding(false);
                setFormState({ title: "", description: "", status: "UPCOMING" });
              }}
            >
              Anuluj
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}