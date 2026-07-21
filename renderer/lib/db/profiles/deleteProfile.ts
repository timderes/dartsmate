import type { Profile } from "@/types/profile";

import database from "../database";

const deleteProfileFromDatabase = async (uuid: Profile["uuid"]) => {
  await database.profiles.where("uuid").equals(uuid).delete();
};

export default deleteProfileFromDatabase;
