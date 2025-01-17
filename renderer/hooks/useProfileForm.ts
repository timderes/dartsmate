import { useForm } from "@mantine/form";
import { useState } from "react";
import { v4 as getUUID } from "uuid";
import type { Profile } from "types/profile";
import { DefaultMantineColor, useMantineTheme } from "@mantine/core";

/**
 *
 * @param isGuestProfile
 *
 */
const useProfileForm = (isGuestProfile: boolean) => {
  const theme = useMantineTheme();
  const userUUID = getUUID();
  const [avatarColor, setAvatarColor] = useState<DefaultMantineColor>(
    theme.primaryColor
  );

  const form = useForm<Profile>({
    initialValues: {
      avatarImage: undefined,
      bio: "",
      createdAt: Date.now(),
      isGuestProfile: isGuestProfile,
      updatedAt: Date.now(),
      color: avatarColor,
      name: {
        firstName: "",
        lastName: "",
      },
      username: "",
      uuid: userUUID,
    },
    validate: {
      name: {
        firstName: (value) =>
          value.length < 3 ? "ERR_FIRST_NAME_TO_SHORT" : null,
        lastName: (value) =>
          value.length < 3 ? "ERR_LAST_NAME_TO_SHORT" : null,
      },
      username: (value) => (value.length < 3 ? "ERR_USERNAME_TO_SHORT" : null),
    },
  });

  const updateAvatarColor = (color: DefaultMantineColor) => {
    setAvatarColor(color);
    form.setValues({ color: color });
  };

  return { form, avatarColor, updateAvatarColor };
};

export default useProfileForm;
