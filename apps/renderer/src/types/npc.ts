export type NPCAttack = {
  id: string;
  name: string;
  note?: string;
};

export type NPCLoot = {
  id: string;
  name: string;
  note?: string;
};

export type NPCAbilities = {
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
};

export type NPC = {
  id: string;
  campaignId: string;
  name: string;
  role: string;
  faction?: string;
  tags?: string[];
  description?: string;
  hpMax?: number;
  hpCurrent?: number;
  ac?: number;
  keyStats?: NPCAbilities;
  abilities?: NPCAttack[];
  weaknesses?: string;
  loot?: NPCLoot[];
  dmNotes?: string;
};