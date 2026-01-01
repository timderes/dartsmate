import { useEffect, useState } from "react";

import getProfileFromDatabase from "@lib/db/profiles/getProfile";

import type { Profile } from "types/profile";

const useDefaultProfile = (): Profile | undefined => {
  const [defaultProfile, setDefaultProfile] = useState<Profile | undefined>(
    undefined,
  );

  useEffect(() => {
    const loadDefaultProfile = async () => {
      try {
        const uuid = (await window.ipc.getDefaultProfileUUID()) as string;
        const profile = await getProfileFromDatabase(uuid);

        setDefaultProfile(profile);
      } catch (err) {
        console.error("Error loading default profile:", err);
      }
    };

    loadDefaultProfile().catch((err) => {
      console.error(err);
    });
  }, []);

  return defaultProfile;
};

export default useDefaultProfile;
