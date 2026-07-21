import type { Profile } from "@/types/profile";

import database from "../database";

const getAllProfilesFromDatabase = async (): Promise<Profile[]> => {
  return await database.profiles.toArray();
};

export default getAllProfilesFromDatabase;
