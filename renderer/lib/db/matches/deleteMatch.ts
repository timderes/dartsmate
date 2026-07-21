import type { Match } from "@/types/match";

import database from "../database";

const deleteMatchFromDatabase = async (uuid: Match["uuid"]) => {
  await database.matches.where("uuid").equals(uuid).delete();
};

export default deleteMatchFromDatabase;
