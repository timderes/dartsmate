import type { Profile } from "@/types/profile";

import database from "../database";

const addProfileToDatabase = async (profile: Profile) => {
  await database.profiles.add(profile);
};

export default addProfileToDatabase;
