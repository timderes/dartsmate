import { useForm } from "@mantine/form";
import { useState } from "react";
import { v4 as getUUID } from "uuid";
import type { Profile } from "types/profile";
import { DefaultMantineColor, useMantineTheme } from "@mantine/core";
import { useTranslation } from "next-i18next";

/**
 *
 * @param isGuestProfile
 *
 */
const useProfileForm = (isGuestProfile: boolean) => {
  const theme = useMantineTheme();
  const userUUID = getUUID();
  const [avatarColor, setAvatarColor] = useState<DefaultMantineColor>(
    theme.primaryColor,
  );
  const { t } = useTranslation(["profile"]);

  const MIN_CHARS_USERNAME = 3;
  const MIN_CHARS_FIRSTNAME = 3;
  const MIN_CHARS_LASTNAME = 3;

  const form = useForm<Profile>({
    initialValues: {
      avatarImage: undefined,
      bio: "",
      createdAt: Date.now(),
      isGuestProfile: isGuestProfile,
      updatedAt: Date.now(),
      color: avatarColor,
      country: undefined,
      statistics: {
        average: 0,
        playedMatches: 0,
        playedTrainings: 0,
        thrownDarts: 0,
        thrownOneHundredAndEighty: 0,
      },
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
          value.length < MIN_CHARS_FIRSTNAME
            ? t("profile:formError.toShort", {
                CHARS: MIN_CHARS_FIRSTNAME,
                FIELD_NAME: t("profile:formLabels.firstName.label"),
              })
            : null,
        lastName: (value) =>
          value.length < MIN_CHARS_LASTNAME
            ? t("profile:formError.toShort", {
                CHARS: MIN_CHARS_LASTNAME,
                FIELD_NAME: t("profile:formLabels.lastName.label"),
              })
            : null,
      },
      username: (value) =>
        value.length < MIN_CHARS_USERNAME
          ? t("profile:formError.toShort", {
              CHARS: MIN_CHARS_USERNAME,
              FIELD_NAME: t("profile:formLabels.username.label"),
            })
          : null,
    },
  });

  const updateAvatarColor = (color: DefaultMantineColor) => {
    setAvatarColor(color);
    form.setValues({ color: color });
  };

  return { form, avatarColor, updateAvatarColor };
};

export default useProfileForm;
