import type { NextPage } from "next";
import DefaultLayout from "@components/layouts/Default";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import type { Profile } from "types/profile";
import { useForm } from "@mantine/form";
import {
  Button,
  CheckIcon,
  ColorSwatch,
  DefaultMantineColor,
  Group,
  Stack,
  Textarea,
  TextInput,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IconUserEdit } from "@tabler/icons-react";
import { useRouter } from "next/router";
import {
  Dropzone,
  type FileWithPath,
  IMAGE_MIME_TYPE,
  type FileRejection,
} from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import resizeAvatarImage from "@utils/avatars/resizeAvatarImage";
import { DEFAULT_AVATAR_FILE_SIZE } from "@utils/avatars/constants";
import ProfileAvatar from "@components/content/ProfileAvatar";
import log from "electron-log/renderer";
import updateProfileFromDatabase from "@lib/db/profiles/updateProfile";
import LoadingOverlay from "@components/LoadingOverlay";
import getProfileFromDatabase from "@/lib/db/profiles/getProfile";

const EditProfilePage: NextPage = () => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const router = useRouter();
  const query = router.query;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarColor, setAvatarColor] = useState<
    DefaultMantineColor | undefined
  >("red"); // The default primary app color

  const form = useForm<Profile>({
    /*
     * Providing initial values prevents runtime errors by ensuring the validate
     * function has data to work with, even before user input.
     */
    initialValues: {
      bio: "",
      color: "red",
      createdAt: 0,
      name: {
        firstName: "",
        lastName: "",
      },
      statistics: {
        average: 0,
        playedMatches: 0,
        playedTrainings: 0,
        thrownDarts: 0,
        thrownOneHundredAndEighty: 0,
      },
      username: "",
      updatedAt: 0,
      uuid: "",
    },
    validate: {
      // Error messages are currently not used. The form only proceeds if all fields are valid.
      // TODO: Show the user which fields are invalid
      name: {
        firstName: (value) =>
          value.length < 3 ? "ERR_FIRST_NAME_TO_SHORT" : null,
        lastName: (value) =>
          value.length < 3 ? "ERR_LAST_NAME_TO_SHORT" : null,
      },
      username: (value) => (value.length < 3 ? "ERR_USERNAME_TO_SHORT" : null),
    },
  });

  useEffect(() => {
    if (!query.uuid) {
      // TODO: Handle this better. But currently its okay
      router.back();
      return;
    }
    void getProfileFromDatabase(query.uuid as string).then((profile) => {
      if (profile) {
        form.setValues(profile);
        setAvatarColor(profile.color);
        setProfile(profile); // Is this needed anymore?
      }
    });
  }, []);

  // Manually update the color, since the ...props method doesn't work on the color swatches
  const updateAvatarColor = (color: DefaultMantineColor) => {
    setAvatarColor(color);
    form.setValues({
      color: color,
    });

    /*
     * Set form to dirty and touched, so the user can submit the form
     * without updating or clicking a form field
     */
    form.setDirty({
      color: true,
    });
    form.setTouched({
      color: true,
    });
  };

  const swatches = Object.keys(theme.colors).map((color) => (
    <Tooltip key={color} label={t(`color.${color}`)} withArrow>
      <ColorSwatch
        color={theme.colors[color][6]}
        style={{ cursor: "pointer" }}
        onClick={() => updateAvatarColor(color)}
      >
        {color === avatarColor ? (
          <CheckIcon width={15} style={{ color: theme.white }} />
        ) : null}
      </ColorSwatch>
    </Tooltip>
  ));

  const handleEdit = () => {
    updateProfileFromDatabase(
      { ...form.values, updatedAt: Date.now() },
      form.values.uuid,
    )
      .then(() => {
        notifications.show({
          title: t("profile:notifications.updateProfileSuccess.title"),
          message: t("profile:notifications.updateProfileSuccess.text"),
        });

        void router.back();
      })
      .catch((err) => {
        log.error("Failed to updated profile. Error:", err);
        notifications.show({
          title: t("profile:notifications.updateProfileError.title"),
          message: t("profile:notifications.updateProfileError.text"),
        });
      });
  };

  const handleFileChange = (files: FileWithPath[]) => {
    const file = files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      if (!e.target) return;

      try {
        const resizedBase64 = await resizeAvatarImage({ file: file });
        form.setFieldValue("avatarImage", resizedBase64);
      } catch (error) {
        log.error("Error resizing the file: ", error);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleImageRejection = (files: FileRejection[]) => {
    /**
     * We expect that the array contains only one file since the dropzone
     * is configured to accept a single file at a time. Nonetheless, we
     * check if files array is not empty to prevent accessing undefined.
     */
    if (files.length === 0) {
      log.error("Expected one image file, but the file array was empty.");
      return;
    }

    const file = files[0];

    notifications.show({
      autoClose: 20000, // 20 seconds
      title: t(`errors.${file.errors[0].code}.title`),
      message: t(`errors.${file.errors[0].code}.message`),
    });
  };

  if (!profile) {
    return <LoadingOverlay />;
  }

  return (
    <DefaultLayout withNavbarOpen>
      <Stack gap="xl" mt="xl">
        <Dropzone
          onDrop={(files) => handleFileChange(files)}
          onReject={(files) => handleImageRejection(files)}
          maxSize={DEFAULT_AVATAR_FILE_SIZE}
          accept={IMAGE_MIME_TYPE}
          maxFiles={1}
          multiple={false}
        >
          <ProfileAvatar profile={form.values} size="xl" mx="auto" />
        </Dropzone>
        <Button
          disabled={!form.values.avatarImage}
          onClick={() => form.setFieldValue("avatarImage", undefined)}
        >
          {t("profile:buttons.resetAvatarImage")}
        </Button>
        <Group mx="auto">{swatches}</Group>
        <Group grow>
          <TextInput
            data-autofocus
            label={t("profile:formLabels.firstName.label")}
            placeholder={t("profile:formLabels.firstName.placeholder")}
            {...form.getInputProps("name.firstName")}
          />
          <TextInput
            label={t("profile:formLabels.lastName.label")}
            placeholder={t("profile:formLabels.lastName.placeholder")}
            {...form.getInputProps("name.lastName")}
          />
        </Group>
        <TextInput
          label={t("profile:formLabels.username.label")}
          placeholder={t("profile:formLabels.username.placeholder")}
          {...form.getInputProps("username")}
        />
        <Textarea
          label={t("profile:formLabels.bio.label")}
          placeholder={t("profile:formLabels.bio.placeholder")}
          {...form.getInputProps("bio")}
        />
        <Group>
          <Button
            disabled={!form.isValid() || !form.isTouched()}
            leftSection={<IconUserEdit />}
            onClick={handleEdit}
          >
            {t("profile:buttons.updateProfile")}
          </Button>
          <Button variant="default" onClick={() => void router.back()}>
            {t("cancel")}
          </Button>
        </Group>
      </Stack>
    </DefaultLayout>
  );
};

export default EditProfilePage;

export const getStaticProps = makeStaticProperties(["common", "profile"]);

export { getStaticPaths };
