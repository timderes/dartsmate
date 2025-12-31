import type { Profile } from "types/profile";

import database from "../database";

//  Prevent overriding `uuid` in the update payload
type PartialProfile = Omit<Partial<Profile>, "uuid">;

const updateProfileFromDatabase = async (
  updatedProfileData: PartialProfile,
  uuid: Profile["uuid"],
) => {
  await database.profiles.where("uuid").equals(uuid).modify(updatedProfileData);
};

export default updateProfileFromDatabase;
