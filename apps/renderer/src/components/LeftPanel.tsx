type Scene = {
  id: string;
  title: string;
  status: "active" | "upcoming" | "done";
};

type LeftPanelProps = {
  scenes: Scene[];
  activeSceneId: string;
  onSelect: (id: string) => void;
};

export function LeftPanel({ scenes, activeSceneId, onSelect }: LeftPanelProps) {
  return (
    <aside className="panel panel--left">
      <h2 className="panel__title">Agenda / Sceny</h2>
      <ul className="scene-list">
        {scenes.map((scene) => (
          <li
            key={scene.id}
            className={`scene-item ${scene.id === activeSceneId ? "scene-item--active" : ""}`}
            onClick={() => {
              console.log("[LeftPanel] click scene", scene.id);
              onSelect(scene.id);
            }}
          >
            <div className="scene-item__title">{scene.title}</div>
            <div className="scene-item__status">{scene.status}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}