import { Match } from "@/types/match";

import database from "../database";

const getMatchFromDatabase = async (uuid: Match["uuid"]) => {
  return await database.matches.where("uuid").equals(uuid).first();
};

export default getMatchFromDatabase;
