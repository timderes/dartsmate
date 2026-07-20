import type { Profile } from "@/types/profile";

import database from "../database";

const getProfileFromDatabase = async (uuid: Profile["uuid"]) => {
  return await database.profiles.where("uuid").equals(uuid).first();
};

export default getProfileFromDatabase;
