export type AbilityScores = {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
};

export type Skill = {
  name: string;
  value: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  qty: number;
  note?: string;
};

export type Feature = {
  id: string;
  name: string;
  note?: string;
};

export type LegendaryAttack = {
  id: string;
  name: string;
  description?: string;
};

export type Spell = {
  id: string;
  name: string;
  note?: string;
};

export type PlayerCharacter = {
  id: string;
  campaignId: string;
  name: string;
  className: string;
  level: number;
  hpMax: number;
  hpCurrent: number;
  ac: number;
  initiative?: number;
  description: string;
  speed: number;
  weaknesses: string;
  conditions: string[];
  abilities: AbilityScores;
  skills?: Skill[];
  inventory?: InventoryItem[];
  features?: Feature[];
  spells?: Spell[];
  legendary: boolean;
  legendaryDescription?: string;
  legendaryAttacks: LegendaryAttack[];
};