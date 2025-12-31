import Dexie, { type EntityTable } from "dexie";
import { APP_NAME } from "utils/constants";
import type { Match } from "types/match";
import type { Profile } from "types/profile";

const lowerCasedAppName = APP_NAME.toLowerCase();

class DartsMateDatabase extends Dexie {
  matches!: EntityTable<Match>;
  profiles!: EntityTable<Profile>;

  constructor() {
    super(lowerCasedAppName);

    // & = Unique index
    this.version(1).stores({
      matches: "&uuid",
      profiles: "&uuid",
    });
  }
}

const database = new DartsMateDatabase();

export default database;
