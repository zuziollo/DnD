import { useEffect, useRef, useState } from "react";
import { TopBar } from "./components/TopBar";
import { LeftPanel } from "./components/LeftPanel";
import { CenterPanel } from "./components/CenterPanel";
import { RightPanel } from "./components/RightPanel";
import { CombatView } from "./components/CombatView";
import { StartView } from "./components/StartView";
import { CampaignView } from "./components/CampaignView";
import { ErrorScreen } from "./components/ErrorScreen";
import { PCListView } from "./components/PCListView";
import { NPCListView } from "./components/NPCListView";
import { MonsterListView } from "./components/MonsterListView";
import type { PlayerCharacter } from "./types/pc";
import type { NPC } from "./types/npc";
import type { Monster } from "./types/monster";
import type { Combatant, CombatLogEntry, CombatSnapshot } from "./types/combat";

type Note = { id: string; text: string; tag: string };
type LogEntry = { id: string; text: string };
type CampaignMeta = { id: string; name: string; createdAt: string };
type SessionMeta = {
  id: string;
  campaignId: string;
  name: string;
  status: "planned" | "active" | "done";
};

const mockScenes = [
  { id: "scene-1", title: "Prolog: Tawerna", status: "active" as const },
  { id: "scene-2", title: "Droga przez las", status: "upcoming" as const },
  { id: "scene-3", title: "Obóz bandytów", status: "upcoming" as const }
];

const mockNotes: Note[] = [
  { id: "note-1", text: "Gracze spotkali kontakt w tawernie.", tag: "NPC" },
  { id: "note-2", text: "Hak: paczka do dostarczenia w ruinach.", tag: "Quest" }
];

const mockLog: LogEntry[] = [
  { id: "log-1", text: "[00:05] Start sesji" },
  { id: "log-2", text: "[00:18] Test percepcji: sukces" }
];

const mockPCs = [
  { id: "pc-1", name: "Aria", hp: "24/30", ac: 15, status: "OK" },
  { id: "pc-2", name: "Brann", hp: "18/28", ac: 17, status: "Lightly Hurt" },
  { id: "pc-3", name: "Lyra", hp: "12/22", ac: 13, status: "Concentrating" }
];

const mockPinned = [
  { id: "npc-1", title: "Kelan (NPC)", detail: "Łowca, kontakt w tawernie" },
  { id: "loc-1", title: "Ruiny na wzgórzu", detail: "Pułapki, tajne wejście" }
];

const defaultCombatants: Combatant[] = [];

const defaultCombatLog: CombatLogEntry[] = [
  { id: "clog-1", timestamp: new Date().toISOString(), message: "Walka gotowa." }
];

function normalizeCombatLogEntries(entries?: any[]): CombatLogEntry[] {
  const source = Array.isArray(entries) && entries.length ? entries : defaultCombatLog;
  return source.map((entry, idx) => ({
    id: entry.id ?? `clog-${Date.now()}-${idx}`,
    timestamp: entry.timestamp ?? new Date().toISOString(),
    message: entry.message ?? entry.text ?? ""
  }));
}

function buildMonsterCombatant(
  monster: Monster,
  existing: Combatant[]
): Combatant {
  const sameSourceCount = existing.filter(
    (c) => c.kind === "MONSTER" && c.sourceId === monster.id
  ).length;
  const suffix = sameSourceCount ? ` (${sameSourceCount + 1})` : "";
  return {
    id: `monster-${monster.id}-${Date.now()}-${sameSourceCount + 1}`,
    name: `${monster.name}${suffix}`,
    kind: "MONSTER",
    sourceId: monster.id,
    hpMax: monster.hpMax ?? 0,
    hpCurrent: monster.hpMax ?? 0,
    ac: monster.ac ?? 0,
    initiative: 0,
    conditions: []
  };
}

type SessionState = {
  mode: "LIVE" | "COMBAT";
  activeSceneId: string;
  notes: Note[];
  logEntries: LogEntry[];
  combatLog: CombatLogEntry[];
  combatants: Combatant[];
  combatRound: number;
  activeCombatantId: string;
  pinnedNpcIds?: string[];
};

type Session = {
  id: string;
  title: string;
  lastPlayedAt: string;
  state: SessionState;
};

type Campaign = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sessions: Session[];
};

export type AppState = {
  schemaVersion: 2;
  campaigns: Campaign[];
  activeCampaignId?: string;
  activeSessionId?: string;
};

declare global {
  interface Window {
    dmStore?: {
      loadState: () => Promise<any | null>;
      saveState: (state: AppState) => Promise<void>;
      resetState: () => Promise<void>;
      info: () => Promise<{
        userData: string;
        settingsPath?: string;
        dataPath?: string;
        stateFilePath: string;
        exists: boolean;
        size: number;
      }>;
      selectDataPath: () => Promise<{
        changed: boolean;
        dataPath?: string;
        stateFilePath?: string;
        settingsPath?: string;
        campaignsFilePath?: string;
        playerCharactersFilePath?: string;
        npcFilePath?: string;
        monsterFilePath?: string;
      }>;
      loadCampaigns: () => Promise<
        | {
            campaigns: CampaignMeta[];
            sessions: SessionMeta[];
          }
        | null
      >;
      saveCampaigns: (payload: { campaigns: CampaignMeta[]; sessions: SessionMeta[] }) => Promise<void>;
      loadPCs: () => Promise<PlayerCharacter[]>;
      savePCs: (payload: PlayerCharacter[]) => Promise<void>;
      loadNPCs: () => Promise<NPC[]>;
      saveNPCs: (payload: NPC[]) => Promise<void>;
      loadMonsters: () => Promise<Monster[]>;
      saveMonsters: (payload: Monster[]) => Promise<void>;
      ping: () => string;
    };
  }
}

export function App() {
  const defaultSession: Session = {
    id: "session-1",
    title: "Sesja 1",
    lastPlayedAt: new Date().toISOString(),
    state: {
      mode: "LIVE",
      activeSceneId: "scene-1",
      notes: mockNotes,
      logEntries: mockLog,
      combatLog: defaultCombatLog,
      combatants: defaultCombatants,
      combatRound: 1,
      activeCombatantId: defaultCombatants[0]?.id ?? "",
      pinnedNpcIds: []
    }
  };

  const defaultCampaign: Campaign = {
    id: "campaign-1",
    name: "Domyślna kampania",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sessions: [defaultSession]
  };

  const defaultState: AppState = {
    schemaVersion: 2,
    campaigns: [defaultCampaign],
    activeCampaignId: defaultCampaign.id,
    activeSessionId: defaultSession.id
  };

  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultState.campaigns);
  const [campaignIndex, setCampaignIndex] = useState<CampaignMeta[]>([
    { id: defaultCampaign.id, name: defaultCampaign.name, createdAt: defaultCampaign.createdAt }
  ]);
  const [sessionsIndex, setSessionsIndex] = useState<SessionMeta[]>([
    {
      id: defaultSession.id,
      campaignId: defaultCampaign.id,
      name: defaultSession.title,
      status: "planned"
    }
  ]);
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | undefined>(
    defaultState.activeCampaignId
  );
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(
    defaultState.activeSessionId
  );

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];
  const activeSession =
    activeCampaign?.sessions.find((s) => s.id === activeSessionId) ||
    activeCampaign?.sessions[0] ||
    defaultSession;

  const [mode, setMode] = useState<SessionState["mode"]>(activeSession.state.mode);
  const [activeSceneId, setActiveSceneId] = useState<string>(activeSession.state.activeSceneId);
  const [notes, setNotes] = useState<typeof mockNotes>(activeSession.state.notes);
  const [logEntries, setLogEntries] = useState<typeof mockLog>(activeSession.state.logEntries);
  const [noteTag, setNoteTag] = useState<string>("NPC");
  const [noteText, setNoteText] = useState<string>("");
  const [combatants, setCombatants] = useState<Combatant[]>(
    activeSession.state.combatants?.length ? activeSession.state.combatants : defaultCombatants
  );
  const [combatRound, setCombatRound] = useState<number>(
    activeSession.state.combatRound ?? 1
  );
  const [activeCombatantId, setActiveCombatantId] = useState<string>(
    activeSession.state.activeCombatantId ?? ""
  );
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>(
    normalizeCombatLogEntries(activeSession.state.combatLog)
  );
  const [combatHistory, setCombatHistory] = useState<CombatSnapshot[]>([]);
  const [playerCharacters, setPlayerCharacters] = useState<PlayerCharacter[]>([]);
  const pcSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pcLibraryOpen, setPcLibraryOpen] = useState(false);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const npcSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [npcLibraryOpen, setNpcLibraryOpen] = useState(false);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const monsterSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [monsterLibraryOpen, setMonsterLibraryOpen] = useState(false);
  const [pinnedNpcIds, setPinnedNpcIds] = useState<string[]>(activeSession.state.pinnedNpcIds ?? []);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [pingValue, setPingValue] = useState<string>("");
  const [dataPath, setDataPath] = useState<string>("");
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [loadInfo, setLoadInfo] = useState<string>("");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const serializeState = (customCampaigns?: Campaign[]): AppState => ({
    schemaVersion: defaultState.schemaVersion,
    activeCampaignId,
    activeSessionId,
    campaigns: (customCampaigns ?? campaigns).map((c) => {
      if (c.id !== activeCampaignId) return c;
      return {
        ...c,
        updatedAt: new Date().toISOString(),
        sessions: c.sessions.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                lastPlayedAt: new Date().toISOString(),
                state: {
                  mode,
                  activeSceneId,
                  notes,
                  logEntries,
                  combatLog,
                  combatants,
                  combatRound,
                  activeCombatantId,
                  pinnedNpcIds
                }
              }
            : s
        )
      };
    })
  });

  const handleAddNote = () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    const newNote = {
      id: `note-${Date.now()}`,
      text: trimmed,
      tag: noteTag.trim() || "General"
    };
    setNotes((prev) => [newNote, ...prev]);
    setNoteText("");
  };

  const handleClearLog = () => setLogEntries([]);

  const handleSceneSelect = (id: string) => {
    console.log("[SceneSelect] clicked", id);
    setActiveSceneId(id);
  };

  useEffect(() => {
    const scene = mockScenes.find((s) => s.id === activeSceneId);
    console.log("[ActiveScene] now", scene?.title ?? activeSceneId);
  }, [activeSceneId]);

  const handleToggleMode = () =>
    setMode((prev) => (prev === "LIVE" ? "COMBAT" : "LIVE"));

  const handlePinNpc = (id: string) => {
    if (!id) return;
    setPinnedNpcIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleUnpinNpc = (id: string) => {
    setPinnedNpcIds((prev) => prev.filter((p) => p !== id));
  };

  const handleOpenPCLibrary = () => setPcLibraryOpen(true);
  const handleClosePCLibrary = () => setPcLibraryOpen(false);
  const handleOpenNPCLibrary = () => setNpcLibraryOpen(true);
  const handleCloseNPCLibrary = () => setNpcLibraryOpen(false);
  const handleOpenMonsterLibrary = () => setMonsterLibraryOpen(true);
  const handleCloseMonsterLibrary = () => setMonsterLibraryOpen(false);

  const handleReset = async () => {
    await window.dmStore?.resetState?.();
    setCampaigns(defaultState.campaigns);
    setActiveCampaignId(defaultState.activeCampaignId);
    setActiveSessionId(defaultState.activeSessionId);
    setMode(defaultSession.state.mode);
    setActiveSceneId(defaultSession.state.activeSceneId);
    setNotes(defaultSession.state.notes);
    setLogEntries(defaultSession.state.logEntries);
    setCombatLog(defaultSession.state.combatLog);
    setCombatants(defaultSession.state.combatants);
    setCombatRound(defaultSession.state.combatRound);
    setActiveCombatantId(defaultSession.state.activeCombatantId);
    setCombatHistory([]);
    setPlayerCharacters([]);
    setMonsters([]);
    setHasLoaded(true);
  };

  const handleSaveNow = async () => {
    const payload = serializeState();
    console.log("[State][renderer] manual save", payload);
    await window.dmStore?.saveState?.(payload);
    if (window.dmStore?.savePCs) {
      await window.dmStore.savePCs(playerCharacters);
    }
    if (window.dmStore?.saveNPCs) {
      await window.dmStore.saveNPCs(npcs);
    }
    if (window.dmStore?.saveMonsters) {
      await window.dmStore.saveMonsters(monsters);
    }
  };

  const handleShowPaths = async () => {
    const info = await window.dmStore?.info?.();
    console.log("[State][renderer] paths/info", info);
    if (info) {
      alert(
        `userData: ${info.userData}\ndataPath: ${info.dataPath ?? "(default userData)"}\nsettingsPath: ${info.settingsPath ?? "(n/a)"}\nstateFilePath: ${info.stateFilePath}\nexists: ${info.exists}\nsize: ${info.size} bytes`
      );
      setDataPath(info.dataPath ?? info.userData);
    }
  };

  const handleSelectDataPath = async () => {
    const res = await window.dmStore?.selectDataPath?.();
    console.log("[State][renderer] selectDataPath result", res);
    if (res?.dataPath) {
      setDataPath(res.dataPath);
      alert(`Nowy folder danych: ${res.dataPath}`);
    }
  };

  const handleOpenStart = () => {
    setActiveCampaignId(undefined);
    setActiveSessionId(undefined);
  };
  const ensureSessionState = (
    campaignId: string,
    sessionId: string,
    sessionTitle: string,
    campaignName?: string
  ) => {
    setCampaigns((prev) => {
      const campaignExists = prev.find((c) => c.id === campaignId);
      if (!campaignExists) {
        const newSession = createDefaultSession(sessionTitle, sessionId.replace("session-", ""));
        return [
          ...prev,
          {
            id: campaignId,
            name: campaignName ?? sessionTitle,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sessions: [{ ...newSession, id: sessionId }]
          }
        ];
      }

      const hasSession = campaignExists.sessions.some((s) => s.id === sessionId);
      if (hasSession) return prev;

      return prev.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              updatedAt: new Date().toISOString(),
              sessions: [
                ...c.sessions,
                {
                  ...createDefaultSession(sessionTitle, sessionId.replace("session-", "")),
                  id: sessionId
                }
              ]
            }
          : c
      );
    });
  };
  const handleShowDiag = () => {
    const msg = {
      hasApi: !!window.dmStore,
      dataPath,
      loadInfo
    };
    console.log("[Diag]", msg);
    alert(`Diagnostyka:\nAPI: ${msg.hasApi}\nData path: ${msg.dataPath}\nLoad info: ${msg.loadInfo}`);
  };

  const snapshotCombatState = (): CombatSnapshot => ({
    combatants: combatants.map((c) => ({ ...c, conditions: [...c.conditions] })),
    combatLog: [...combatLog],
    activeCombatantId,
    round: combatRound
  });

  const pushCombatHistory = () => {
    setCombatHistory((prev) => [...prev, snapshotCombatState()]);
  };

  const restoreCombatSnapshot = () => {
    let snapshot: CombatSnapshot | undefined;
    setCombatHistory((prev) => {
      const next = [...prev];
      snapshot = next.pop();
      return next;
    });
    if (snapshot) {
      setCombatants(snapshot.combatants);
      setCombatLog(snapshot.combatLog);
      setActiveCombatantId(snapshot.activeCombatantId);
      setCombatRound(snapshot.round);
      syncEntitiesFromCombatants(snapshot.combatants);
    }
  };

  const appendCombatLog = (message: string) => {
    const entry: CombatLogEntry = {
      id: `clog-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message
    };
    setCombatLog((prev) => [...prev, entry]);
  };

  const normalizePC = (pc: PlayerCharacter): PlayerCharacter => ({
    ...pc,
    description: pc.description ?? "",
    speed: pc.speed ?? 30,
    weaknesses: pc.weaknesses ?? "",
    abilities: pc.abilities ?? {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    },
    conditions: pc.conditions ?? [],
    spells: pc.spells ?? [],
    inventory: pc.inventory ?? [],
    features: pc.features ?? []
  });

  const handleUpsertPC = (pc: PlayerCharacter) => {
    setPlayerCharacters((prev) => {
      const exists = prev.some((p) => p.id === pc.id);
      if (exists) {
        return prev.map((p) => (p.id === pc.id ? normalizePC(pc) : p));
      }
      return [...prev, normalizePC(pc)];
    });
  };

  const handleUpsertNPC = (npc: NPC) => {
    setNpcs((prev) => {
      const exists = prev.some((n) => n.id === npc.id);
      if (exists) return prev.map((n) => (n.id === npc.id ? { ...n, ...npc } : n));
      return [...prev, npc];
    });
  };

  const normalizeMonster = (monster: Monster): Monster => ({
    ...monster,
    size: monster.size ?? "Medium",
    alignment: monster.alignment ?? "Neutral",
    movement: monster.movement ?? { walk: true, fly: false, swim: false },
    traits: monster.traits ?? [],
    actions: monster.actions ?? [],
    weaknesses: monster.weaknesses ?? "",
    notes: monster.notes ?? ""
  });

  const handleUpsertMonster = (monster: Monster) => {
    setMonsters((prev) => {
      const exists = prev.some((m) => m.id === monster.id);
      if (exists) return prev.map((m) => (m.id === monster.id ? normalizeMonster(monster) : m));
      return [...prev, normalizeMonster(monster)];
    });
  };

  const toCombatantFromPC = (pc: PlayerCharacter): Combatant => ({
    id: pc.id,
    name: pc.name,
    kind: "PC",
    sourceId: pc.id,
    hpMax: pc.hpMax ?? 0,
    hpCurrent: pc.hpCurrent ?? 0,
    ac: pc.ac ?? 0,
    initiative: pc.initiative ?? 0,
    conditions: pc.conditions ?? []
  });

  const toCombatantFromNPC = (npc: NPC): Combatant => ({
    id: npc.id,
    name: npc.name,
    kind: "NPC",
    sourceId: npc.id,
    hpMax: npc.hpMax ?? 0,
    hpCurrent: npc.hpCurrent ?? 0,
    ac: npc.ac ?? 0,
    initiative: 0,
    conditions: []
  });

  const toCombatantFromMonster = (monster: Monster, existing: Combatant[]): Combatant =>
    buildMonsterCombatant(monster, existing);

  const ensureActiveCombatant = (list: Combatant[]) => {
    if (!activeCombatantId && list.length) {
      setActiveCombatantId(list[0].id);
    }
  };

  const handleAddPCCombatants = (ids: string[]) => {
    const additions = playerCharacters
      .filter((pc) => ids.includes(pc.id))
      .map((pc) => toCombatantFromPC(pc));
    if (!additions.length) return;
    pushCombatHistory();
    setCombatants((prev) => {
      const merged = [...prev];
      additions.forEach((c) => {
        if (!merged.some((m) => m.id === c.id)) merged.push(c);
      });
      ensureActiveCombatant(merged);
      return merged;
    });
    additions.forEach((c) => appendCombatLog(`${c.name} (PC) dołącza do walki`));
  };

  const handleAddNPCCombatants = (ids: string[]) => {
    const additions = npcs
      .filter((npc) => ids.includes(npc.id))
      .map((npc) => toCombatantFromNPC(npc));
    if (!additions.length) return;
    pushCombatHistory();
    setCombatants((prev) => {
      const merged = [...prev];
      additions.forEach((c) => {
        if (!merged.some((m) => m.id === c.id)) merged.push(c);
      });
      ensureActiveCombatant(merged);
      return merged;
    });
    additions.forEach((c) => appendCombatLog(`${c.name} (NPC) dołącza do walki`));
  };

  const handleAddMonsterCombatants = (ids: string[]) => {
    const selected = monsters.filter((m) => ids.includes(m.id));
    if (!selected.length) return;
    pushCombatHistory();
    setCombatants((prev) => {
      const merged = [...prev];
      selected.forEach((monster) => {
        const combatant = toCombatantFromMonster(monster, merged);
        merged.push(combatant);
        appendCombatLog(`${combatant.name} (Potwór) dołącza do walki`);
      });
      ensureActiveCombatant(merged);
      return merged;
    });
  };

  const handleAddAdHocCombatant = (name: string, hpMax: number, ac: number) => {
    if (!name.trim()) return;
    const combatant: Combatant = {
      id: `adhoc-${Date.now()}`,
      name: name.trim(),
      kind: "ADHOC",
      hpMax: hpMax || 0,
      hpCurrent: hpMax || 0,
      ac: ac || 0,
      initiative: 0,
      conditions: []
    };
    pushCombatHistory();
    setCombatants((prev) => {
      const merged = [...prev, combatant];
      ensureActiveCombatant(merged);
      return merged;
    });
    appendCombatLog(`${combatant.name} (ad hoc) dołącza do walki`);
  };

  const handleUpdateInitiative = (id: string, value: number) => {
    setCombatants((prev) => prev.map((c) => (c.id === id ? { ...c, initiative: value } : c)));
  };

  const handleSortInitiative = () => {
    pushCombatHistory();
    setCombatants((prev) => {
      const sorted = [...prev].sort((a, b) => b.initiative - a.initiative);
      if (sorted.length && !activeCombatantId) {
        setActiveCombatantId(sorted[0].id);
      }
      return sorted;
    });
  };

  const handleNextTurn = () => {
    if (!combatants.length) return;
    pushCombatHistory();
    const currentIndex = combatants.findIndex((c) => c.id === activeCombatantId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % combatants.length;
    if (currentIndex !== -1 && nextIndex === 0) {
      setCombatRound((prev) => prev + 1);
    }
    setActiveCombatantId(combatants[nextIndex].id);
  };

  const updateHpForEntity = (combatantId: string, nextHp: number, kind: Combatant["kind"]) => {
    if (kind === "PC") {
      setPlayerCharacters((prev) =>
        prev.map((pc) => (pc.id === combatantId ? { ...pc, hpCurrent: nextHp } : pc))
      );
    }
    if (kind === "NPC") {
      setNpcs((prev) => prev.map((npc) => (npc.id === combatantId ? { ...npc, hpCurrent: nextHp } : npc)));
    }
    if (kind === "MONSTER") {
      setMonsters((prev) =>
        prev.map((m) =>
          m.id === combatantId || m.id === combatants.find((c) => c.id === combatantId)?.sourceId
            ? { ...m, hpMax: m.hpMax, hpCurrent: nextHp }
            : m
        )
      );
    }
  };

  const syncEntitiesFromCombatants = (list: Combatant[]) => {
    setPlayerCharacters((prev) =>
      prev.map((pc) => {
        const match = list.find((c) => c.sourceId === pc.id && c.kind === "PC");
        return match ? { ...pc, hpCurrent: match.hpCurrent, conditions: match.conditions } : pc;
      })
    );
    setNpcs((prev) =>
      prev.map((npc) => {
        const match = list.find((c) => c.sourceId === npc.id && c.kind === "NPC");
        return match ? { ...npc, hpCurrent: match.hpCurrent } : npc;
      })
    );
    setMonsters((prev) =>
      prev.map((m) => {
        const match = list.find(
          (c) => c.kind === "MONSTER" && (c.sourceId === m.id || c.id === m.id)
        );
        return match ? { ...m, hpMax: m.hpMax, hpCurrent: match.hpCurrent } : m;
      })
    );
  };

  const handleDamage = (id: string, amount: number) => {
    if (!amount) return;
    pushCombatHistory();
    setCombatants((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== id) return c;
        const hpCurrent = Math.max(0, c.hpCurrent - amount);
        updateHpForEntity(c.id, hpCurrent, c.kind);
        appendCombatLog(`${c.name} otrzymuje ${amount} obrażeń (HP ${hpCurrent}/${c.hpMax})`);
        return { ...c, hpCurrent };
      });
      return updated;
    });
  };

  const handleHeal = (id: string, amount: number) => {
    if (!amount) return;
    pushCombatHistory();
    setCombatants((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== id) return c;
        const hpCurrent = Math.min(c.hpMax, c.hpCurrent + amount);
        updateHpForEntity(c.id, hpCurrent, c.kind);
        appendCombatLog(`${c.name} leczy ${amount} (HP ${hpCurrent}/${c.hpMax})`);
        return { ...c, hpCurrent };
      });
      return updated;
    });
  };

  const handleAddCondition = (id: string, condition: string) => {
    if (!condition.trim()) return;
    pushCombatHistory();
    setCombatants((prev) =>
      prev.map((c) =>
        c.id === id && !c.conditions.includes(condition.trim())
          ? { ...c, conditions: [...c.conditions, condition.trim()] }
          : c
      )
    );
    const target = combatants.find((c) => c.id === id);
    if (target?.kind === "PC") {
      setPlayerCharacters((prev) =>
        prev.map((pc) =>
          pc.id === target.id && !pc.conditions.includes(condition.trim())
            ? { ...pc, conditions: [...pc.conditions, condition.trim()] }
            : pc
        )
      );
    }
    if (target) appendCombatLog(`${target.name} otrzymuje stan: ${condition.trim()}`);
  };

  const handleRemoveCondition = (id: string, condition: string) => {
    pushCombatHistory();
    setCombatants((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, conditions: c.conditions.filter((cond: string) => cond !== condition) }
          : c
      )
    );
    const target = combatants.find((c) => c.id === id);
    if (target?.kind === "PC") {
      setPlayerCharacters((prev) =>
        prev.map((pc) =>
          pc.id === target.id
            ? { ...pc, conditions: pc.conditions.filter((cond: string) => cond !== condition) }
            : pc
        )
      );
    }
  };

  const handleUndoCombat = () => {
    restoreCombatSnapshot();
  };

  const handleEndCombat = () => {
    appendCombatLog("Walka zakończona");
    setLogEntries((prev) => [
      { id: `log-${Date.now()}`, text: `Zakończono walkę (runda ${combatRound})` },
      ...prev
    ]);
    setMode("LIVE");
  };

  const createDefaultSession = (title: string, idSuffix?: string): Session => {
    const now = new Date().toISOString();
    return {
      id: idSuffix ? `session-${idSuffix}` : `session-${Date.now()}`,
      title,
      lastPlayedAt: now,
      state: {
        mode: "LIVE",
        activeSceneId: "scene-1",
        notes: mockNotes,
        logEntries: mockLog,
        combatLog: defaultCombatLog,
        combatants: defaultCombatants,
        combatRound: 1,
        activeCombatantId: defaultCombatants[0]?.id ?? "",
        pinnedNpcIds: []
      }
    };
  };

  const loadSessionIntoState = (campaignId?: string, sessionId?: string) => {
    const camp =
      campaigns.find((c) => c.id === campaignId) ||
      campaigns.find((c) => c.id === activeCampaignId) ||
      campaigns[0];
    const session =
      camp?.sessions.find((s) => s.id === sessionId) ||
      camp?.sessions.find((s) => s.id === activeSessionId) ||
      camp?.sessions[0];
    if (camp && session) {
      setActiveCampaignId(camp.id);
      setActiveSessionId(session.id);
      setMode(session.state.mode);
      setActiveSceneId(session.state.activeSceneId);
      setNotes(session.state.notes);
      setLogEntries(session.state.logEntries);
      setCombatLog(normalizeCombatLogEntries(session.state.combatLog));
      setCombatants(session.state.combatants ?? defaultCombatants);
      setCombatRound(session.state.combatRound ?? 1);
      setActiveCombatantId(session.state.activeCombatantId ?? "");
      setPinnedNpcIds(session.state.pinnedNpcIds ?? []);
    }
  };

  // Load persisted state on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!window.dmStore?.loadState) return;
      const ping = window.dmStore?.ping?.();
      console.log("[State][renderer] ping from preload:", ping);
      if (mounted && ping) setPingValue(ping);
      console.log("[State][renderer] loadState invoked");
      try {
        const saved = await window.dmStore.loadState();
        if (saved && mounted) {
          if (saved.schemaVersion === 2 && Array.isArray(saved.campaigns)) {
            console.log("[State][renderer] loaded v2 state", saved);
            setCampaigns(saved.campaigns);
            setActiveCampaignId(saved.activeCampaignId ?? saved.campaigns[0]?.id);
            const camp =
              saved.campaigns.find((c: Campaign) => c.id === saved.activeCampaignId) ||
              saved.campaigns[0];
            setActiveSessionId(
              saved.activeSessionId ??
                camp?.sessions[0]?.id ??
                defaultState.activeSessionId
            );
            loadSessionIntoState(
              saved.activeCampaignId ?? camp?.id,
              saved.activeSessionId ?? camp?.sessions[0]?.id
            );
          } else if (saved.schemaVersion === 1 || saved.mode) {
            console.log("[State][renderer] migrating legacy state to campaigns structure");
            const migratedCampaign: Campaign = {
              id: "campaign-1",
              name: "Domyślna kampania",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              sessions: [
                {
                  id: "session-1",
                  title: "Sesja 1",
                  lastPlayedAt: new Date().toISOString(),
                  state: {
                    mode: saved.mode ?? defaultSession.state.mode,
                    activeSceneId: saved.activeSceneId ?? defaultSession.state.activeSceneId,
                    notes: saved.notes ?? defaultSession.state.notes,
                    logEntries: saved.logEntries ?? defaultSession.state.logEntries,
                    combatLog: normalizeCombatLogEntries(saved.combatLog),
                    combatants: saved.combatants ?? defaultCombatants,
                    combatRound: saved.combatRound ?? 1,
                    activeCombatantId:
                      saved.activeCombatantId ?? defaultSession.state.activeCombatantId
                  }
                }
              ]
            };
            setCampaigns([migratedCampaign]);
            setActiveCampaignId(migratedCampaign.id);
            setActiveSessionId(migratedCampaign.sessions[0].id);
            loadSessionIntoState(migratedCampaign.id, migratedCampaign.sessions[0].id);
          } else {
            console.log("[State][renderer] using default (missing or schema mismatch)");
          }
          const info = await window.dmStore.info?.();
          if (info?.dataPath || info?.userData) {
            setDataPath(info.dataPath ?? info.userData);
          }
          setLoadInfo(
            `loaded schema ${saved.schemaVersion ?? "unknown"}, campaigns: ${
              saved.campaigns?.length ?? "n/a"
            }`
          );
        }
      } catch (err) {
        console.error("[State][renderer] load error", err);
        setFatalError(String(err));
      } finally {
        if (mounted) setHasLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load campaigns/sessions index from campaigns.json
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!window.dmStore?.loadCampaigns) {
        setCampaignsLoaded(true);
        return;
      }
      try {
        const data = await window.dmStore.loadCampaigns();
        console.log("[Campaigns][renderer] load", data);
        if (!mounted) return;
        if (data?.campaigns?.length) {
          setCampaignIndex(data.campaigns);
          setSessionsIndex(data.sessions ?? []);
          if (!activeCampaignId) setActiveCampaignId(data.campaigns[0].id);
          const firstSession = data.sessions?.find(
            (s) => s.campaignId === (data.campaigns[0]?.id ?? "")
          );
          if (!activeSessionId && firstSession) setActiveSessionId(firstSession.id);
        } else {
          // persist defaults
          window.dmStore
            .saveCampaigns?.({ campaigns: campaignIndex, sessions: sessionsIndex })
            .catch((err) => console.error("[Campaigns][renderer] save default error", err));
        }
      } catch (err) {
        console.error("[Campaigns][renderer] load error", err);
      } finally {
        if (mounted) setCampaignsLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load player characters from dedicated storage
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const pcs = await window.dmStore?.loadPCs?.();
        if (mounted && pcs) {
          setPlayerCharacters(pcs.map(normalizePC));
        }
      } catch (err) {
        console.error("[PC][renderer] load error", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load NPCs from storage
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await window.dmStore?.loadNPCs?.();
        if (mounted && data) {
          setNpcs(data as NPC[]);
        }
      } catch (err) {
        console.error("[NPC][renderer] load error", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load Monsters from storage
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await window.dmStore?.loadMonsters?.();
        if (mounted && data) {
          setMonsters((data as Monster[]).map(normalizeMonster));
        }
      } catch (err) {
        console.error("[Monster][renderer] load error", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Save campaigns index when it changes
  useEffect(() => {
    if (!campaignsLoaded || !window.dmStore?.saveCampaigns) return;
    const payload = { campaigns: campaignIndex, sessions: sessionsIndex };
    console.log("[Campaigns][renderer] save", payload);
    window.dmStore.saveCampaigns(payload).catch((err) =>
      console.error("[Campaigns][renderer] save error", err)
    );
  }, [campaignIndex, sessionsIndex, campaignsLoaded]);

  // Debounced save of player characters
  useEffect(() => {
    if (!window.dmStore?.savePCs) return;
    if (pcSaveTimeout.current) clearTimeout(pcSaveTimeout.current);
    pcSaveTimeout.current = setTimeout(() => {
      console.log("[PC][renderer] save", playerCharacters);
      window.dmStore?.savePCs?.(playerCharacters);
    }, 400);
    return () => {
      if (pcSaveTimeout.current) {
        clearTimeout(pcSaveTimeout.current);
      }
    };
  }, [playerCharacters]);

  // Debounced save of NPCs
  useEffect(() => {
    if (!window.dmStore?.saveNPCs) return;
    if (npcSaveTimeout.current) clearTimeout(npcSaveTimeout.current);
    npcSaveTimeout.current = setTimeout(() => {
      console.log("[NPC][renderer] save", npcs);
      window.dmStore?.saveNPCs?.(npcs);
    }, 400);
    return () => {
      if (npcSaveTimeout.current) {
        clearTimeout(npcSaveTimeout.current);
      }
    };
  }, [npcs]);

  // Debounced save of Monsters
  useEffect(() => {
    if (!window.dmStore?.saveMonsters) return;
    if (monsterSaveTimeout.current) clearTimeout(monsterSaveTimeout.current);
    monsterSaveTimeout.current = setTimeout(() => {
      console.log("[Monster][renderer] save", monsters);
      window.dmStore?.saveMonsters?.(monsters);
    }, 400);
    return () => {
      if (monsterSaveTimeout.current) {
        clearTimeout(monsterSaveTimeout.current);
      }
    };
  }, [monsters]);

  // Debounced save when key state changes
  useEffect(() => {
    if (!window.dmStore?.saveState || !hasLoaded) return;
    const updatedCampaigns = serializeState().campaigns;
    setCampaigns(updatedCampaigns);
    const state = serializeState(updatedCampaigns);
    console.log("[State][renderer] schedule save", state);
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
      window.dmStore?.saveState?.(state);
    }, 400);
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [
    mode,
    activeSceneId,
    notes,
    logEntries,
    combatLog,
    combatants,
    combatRound,
    activeCombatantId,
    pinnedNpcIds,
    hasLoaded,
    campaigns,
    activeCampaignId,
    activeSessionId
  ]);

  // Flush save before unload
  useEffect(() => {
    const handler = () => {
      if (!window.dmStore?.saveState) return;
      const state = serializeState();
      console.log("[State][renderer] beforeunload flush save", state);
      window.dmStore.saveState(state);
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  });

  return (
    <div className="app-shell">
      {fatalError ? (
        <ErrorScreen
          error={fatalError}
          detail="Sprawdź konsolę renderer/main. Jeśli API preload jest niedostępne, upewnij się, że preload.js istnieje w dist."
          onRetry={() => window.location.reload()}
        />
      ) : (
        <>
          <TopBar
            sessionName="Sesja 12: Tajemnice Ruin"
            mode={mode}
            onToggleMode={handleToggleMode}
            onAddNote={handleAddNote}
            onReset={handleReset}
            onSaveNow={handleSaveNow}
            onShowPaths={handleShowPaths}
            onSelectDataPath={handleSelectDataPath}
            onShowStart={handleOpenStart}
            onShowDiag={handleShowDiag}
            onShowPCLibrary={handleOpenPCLibrary}
            onShowNPCLibrary={handleOpenNPCLibrary}
            onShowMonsterLibrary={handleOpenMonsterLibrary}
          />
          <div className="ping-banner">
            Preload ping: {pingValue || "…"} | Folder danych: {dataPath || "(ładowanie...)"}
          </div>
          {monsterLibraryOpen ? (
            <MonsterListView
              monsters={monsters}
              onClose={handleCloseMonsterLibrary}
              onUpsert={handleUpsertMonster}
            />
          ) : npcLibraryOpen ? (
            <NPCListView npcs={npcs} onClose={handleCloseNPCLibrary} onUpsert={handleUpsertNPC} />
          ) : pcLibraryOpen ? (
            <PCListView
              pcs={playerCharacters}
              onClose={handleClosePCLibrary}
              onUpsert={handleUpsertPC}
            />
          ) : !activeCampaignId ? (
            <StartView
              campaigns={campaignIndex}
              onEnter={(campaignId) => {
                setActiveCampaignId(campaignId);
                const firstSession = sessionsIndex.find((s) => s.campaignId === campaignId);
                setActiveSessionId(firstSession?.id);
                if (firstSession) {
                  const campName = campaignIndex.find((c) => c.id === campaignId)?.name;
                  ensureSessionState(campaignId, firstSession.id, firstSession.name, campName);
                  loadSessionIntoState(campaignId, firstSession.id);
                }
              }}
              onCreate={(name) => {
                const id = `campaign-${Date.now()}`;
                const createdAt = new Date().toISOString();
                const sessionId = `session-${Date.now()}`;
                setCampaignIndex((prev) => [...prev, { id, name, createdAt }]);
                setSessionsIndex((prev) => [
                  ...prev,
                  { id: sessionId, campaignId: id, name: "Sesja 1", status: "planned" }
                ]);
                ensureSessionState(id, sessionId, "Sesja 1", name);
                setActiveCampaignId(id);
                setActiveSessionId(sessionId);
                loadSessionIntoState(id, sessionId);
              }}
            />
          ) : activeCampaignId && !activeSessionId ? (
            <CampaignView
              campaignName={
                campaignIndex.find((c) => c.id === activeCampaignId)?.name || defaultCampaign.name
              }
              sessions={sessionsIndex
                .filter((s) => s.campaignId === activeCampaignId)
                .map((s) => ({ id: s.id, title: s.name, status: s.status }))}
              onOpenSession={(sessionId: string) => {
                setActiveSessionId(sessionId);
                const sessionMeta = sessionsIndex.find((s) => s.id === sessionId);
                if (sessionMeta) {
                  const campName = campaignIndex.find((c) => c.id === activeCampaignId)?.name;
                  ensureSessionState(activeCampaignId, sessionId, sessionMeta.name, campName);
                  loadSessionIntoState(activeCampaignId, sessionId);
                }
              }}
              onCreateSession={(title: string) => {
                const sessionId = `session-${Date.now()}`;
                setSessionsIndex((prev) => [
                  ...prev,
                  { id: sessionId, campaignId: activeCampaignId, name: title, status: "planned" }
                ]);
                const campName = campaignIndex.find((c) => c.id === activeCampaignId)?.name;
                ensureSessionState(activeCampaignId, sessionId, title, campName);
                setActiveSessionId(sessionId);
                loadSessionIntoState(activeCampaignId, sessionId);
              }}
              onBack={() => {
                setActiveCampaignId(undefined);
                setActiveSessionId(undefined);
              }}
            />
          ) : mode === "LIVE" ? (
            <div className="layout">
              <LeftPanel
                scenes={mockScenes}
                activeSceneId={activeSceneId}
                onSelect={handleSceneSelect}
              />
              <CenterPanel
                mode={mode}
                notes={notes}
                logEntries={logEntries}
                noteTag={noteTag}
                noteText={noteText}
                onNoteTagChange={setNoteTag}
                onNoteTextChange={setNoteText}
                onAddNote={handleAddNote}
                onClearLog={handleClearLog}
                activeSceneTitle={
                  mockScenes.find((s) => s.id === activeSceneId)?.title ?? "—"
                }
              />
              <RightPanel
                pcs={playerCharacters}
                npcs={npcs}
                pinnedNpcIds={pinnedNpcIds}
                onPinNpc={handlePinNpc}
                onUnpinNpc={handleUnpinNpc}
                onOpenPCs={handleOpenPCLibrary}
                onOpenNPCs={handleOpenNPCLibrary}
                onUpdatePC={(id, patch) => handleUpsertPC({
                  ...(playerCharacters.find((p) => p.id === id) ?? {
                    id,
                    name: "",
                    className: "",
                    level: 1,
                    hpMax: 0,
                    hpCurrent: 0,
                    ac: 0,
                    description: "",
                    speed: 30,
                    weaknesses: "",
                    conditions: [],
                    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                    spells: [],
                    inventory: [],
                    features: []
                  }),
                  ...patch
                })}
              />
            </div>
          ) : (
            <div className="layout">
              <CombatView
                combatants={combatants}
                combatLog={combatLog}
                activeCombatantId={activeCombatantId}
                round={combatRound}
                pcs={playerCharacters}
                npcs={npcs}
                monsters={monsters}
                onAddPCs={handleAddPCCombatants}
                onAddNPCs={handleAddNPCCombatants}
                onAddMonsters={handleAddMonsterCombatants}
                onAddAdHoc={handleAddAdHocCombatant}
                onUpdateInitiative={handleUpdateInitiative}
                onSortInitiative={handleSortInitiative}
                onNextTurn={handleNextTurn}
                onDamage={handleDamage}
                onHeal={handleHeal}
                onAddCondition={handleAddCondition}
                onRemoveCondition={handleRemoveCondition}
                onUndo={handleUndoCombat}
                onEndCombat={handleEndCombat}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}