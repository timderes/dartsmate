import { useProfile } from "@/contexts/ProfileContext";
import type { Profile } from "types/profile";

const useDefaultProfile = (): Profile | undefined => {
  const { profile } = useProfile();
  return profile;
};

export default useDefaultProfile;
