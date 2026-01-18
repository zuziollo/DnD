import type { Monster } from "../types/monster";
import type { MonsterRepository } from "./MonsterRepository";

export class SqliteMonsterRepository implements MonsterRepository {
  // TODO: implement SQLite backing store.
  // Tables needed:
  // - monsters (id, name, type, cr, hpMax, ac, speed, size, alignment, movement, weaknesses, notes)
  // - monster_traits (id, monsterId, name, description)
  // - monster_actions (id, monsterId, name, description)
  async list(): Promise<Monster[]> {
    throw new Error("Not implemented");
  }

  async upsert(_monster: Monster): Promise<void> {
    throw new Error("Not implemented");
  }

  async remove(_id: string): Promise<void> {
    throw new Error("Not implemented");
  }
}