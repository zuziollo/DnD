import type { Monster } from "../types/monster";

export interface MonsterRepository {
  list(): Promise<Monster[]>;
  upsert(monster: Monster): Promise<void>;
  remove(id: string): Promise<void>;
}

type MonsterStoreApi = {
  loadMonsters?: () => Promise<Monster[]>;
  saveMonsters?: (payload: Monster[]) => Promise<void>;
};

export class JsonMonsterRepository implements MonsterRepository {
  private api: MonsterStoreApi;

  constructor(api: MonsterStoreApi | undefined) {
    this.api = api ?? {};
  }

  async list(): Promise<Monster[]> {
    if (!this.api.loadMonsters) return [];
    const data = await this.api.loadMonsters();
    return Array.isArray(data) ? data : [];
  }

  async upsert(monster: Monster): Promise<void> {
    if (!this.api.saveMonsters) return;
    const current = await this.list();
    const exists = current.some((m) => m.id === monster.id);
    const next = exists
      ? current.map((m) => (m.id === monster.id ? monster : m))
      : [...current, monster];
    await this.api.saveMonsters(next);
  }

  async remove(id: string): Promise<void> {
    if (!this.api.saveMonsters) return;
    const current = await this.list();
    const next = current.filter((m) => m.id !== id);
    await this.api.saveMonsters(next);
  }
}