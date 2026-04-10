import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import getProfileFromDatabase from "@/lib/db/profiles/getProfile";
import type { Profile } from "types/profile";

type ProfileContextType = {
  profile: Profile | undefined;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: PropsWithChildren) => {
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const uuid = (await window.ipc.getDefaultProfileUUID()) as string;
      if (uuid) {
        const profileData = await getProfileFromDatabase(uuid);
        setProfile(profileData);
      } else {
        setProfile(undefined);
      }
    } catch (err) {
      console.error("Error loading profile into context:", err);
      setProfile(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, isLoading, refreshProfile: loadProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
