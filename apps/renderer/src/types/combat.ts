export type CombatantKind = "PC" | "NPC" | "MONSTER" | "ADHOC";

export type Combatant = {
  id: string;
  name: string;
  kind: CombatantKind;
  /** Optional reference to the source entity (PC/NPC/Monster id) */
  sourceId?: string;
  hpMax: number;
  hpCurrent: number;
  ac: number;
  initiative: number;
  conditions: string[];
};

export type CombatLogEntry = {
  id: string;
  timestamp: string;
  message: string;
};

export type CombatSnapshot = {
  combatants: Combatant[];
  combatLog: CombatLogEntry[];
  activeCombatantId: string;
  round: number;
};