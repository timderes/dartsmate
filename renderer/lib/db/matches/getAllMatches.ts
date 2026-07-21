import type { Match } from "@/types/match";

import database from "../database";

const getAllMatchesFromDatabase = async (): Promise<Match[]> => {
  return await database.matches.toArray();
};

export default getAllMatchesFromDatabase;
