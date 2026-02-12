import { useEffect, useState } from "react";

import type { Profile } from "@/types/profile";
import getAllProfilesFromDatabase from "@/lib/db/profiles/getAllProfiles";

const useGetAllProfiles = (): Profile[] | undefined => {
  const [profiles, setProfiles] = useState<Profile[] | undefined>(undefined);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const allProfiles = await getAllProfilesFromDatabase();
        setProfiles(allProfiles);
      } catch (err) {
        console.error("Error loading profiles:", err);
      }
    };
    loadProfiles().catch((err) => {
      console.error(err);
    });
  }, []);
  return profiles;
};

export default useGetAllProfiles;
