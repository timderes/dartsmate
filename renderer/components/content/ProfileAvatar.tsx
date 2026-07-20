import { Avatar } from "@mantine/core";
import type { AvatarProps } from "@mantine/core";
import type { Profile } from "@/types/profile";

type ProfileAvatarProps = AvatarProps & {
  profile: Profile;
};

const ProfileAvatar = ({
  profile,
  ...mantineAvatarProps
}: ProfileAvatarProps) => {
  return (
    <Avatar
      color={profile.color}
      name={profile.username}
      src={profile.avatarImage}
      variant="filled"
      {...mantineAvatarProps}
    />
  );
};

export default ProfileAvatar;
