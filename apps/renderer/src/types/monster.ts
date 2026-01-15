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
  speed: number;
  size: "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
  alignment: string;
  movement: MonsterMovement;
  traits?: MonsterTrait[];
  actions?: MonsterAction[];
  weaknesses?: string;
  notes?: string;
};