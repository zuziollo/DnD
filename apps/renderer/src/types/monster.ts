export type MonsterTrait = {
  id: string;
  name: string;
  note?: string;
};

export type MonsterAction = {
  id: string;
  name: string;
  note?: string;
};

export type MonsterLegendaryAttack = {
  id: string;
  name: string;
  description?: string;
};

export type MonsterWeakness = {
  id: string;
  name: string;
  note?: string;
};

export type MonsterMovement = {
  walk: boolean;
  fly: boolean;
  swim: boolean;
};

export type Monster = {
  id: string;
  name: string;
  type: string;
  cr: number;
  hpMax: number;
  ac: number;
  speed: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  size: "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
  alignment: string;
  movement: MonsterMovement;
  traits?: MonsterTrait[];
  actions?: MonsterAction[];
  weaknesses?: MonsterWeakness[];
  legendary: boolean;
  legendaryDescription?: string;
  legendaryAttacks: MonsterLegendaryAttack[];
  languages: string[];
  notes?: string;
};