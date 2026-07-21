import type { Match } from "@/types/match";

import database from "../database";

const addMatchToDatabase = async (match: Match) => {
  await database.matches.add(match);
};

export default addMatchToDatabase;
