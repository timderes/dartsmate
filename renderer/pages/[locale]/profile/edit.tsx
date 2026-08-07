import type { NextPage } from "next";
import DefaultLayout from "@/components/layouts/Default";
import { makeStaticProperties } from "@/lib/getStatic";
import { useTranslation } from "next-i18next/pages";
import { useEffect, useState, useMemo } from "react";
import type { Profile } from "@/types/profile";
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
import resizeAvatarImage from "@/utils/avatars/resizeAvatarImage";
import { DEFAULT_AVATAR_FILE_SIZE } from "@/utils/avatars/constants";
import ProfileAvatar from "@/components/content/ProfileAvatar";
import log from "electron-log/renderer";
import updateProfileFromDatabase from "@/lib/db/profiles/updateProfile";
import getProfileFromDatabase from "@/lib/db/profiles/getProfile";
import LoadingOverlay from "@/components/LoadingOverlay";

import { useProfile } from "@/contexts/ProfileContext";

const EditProfilePage: NextPage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const theme = useMantineTheme();
  const router = useRouter();
  const { refreshProfile } = useProfile();
  const [isLoading, setIsLoading] = useState(true);

  const [avatarColor, setAvatarColor] = useState<DefaultMantineColor>(
    theme.primaryColor ?? "red",
  );

  const form = useForm<Profile>({
    initialValues: {
      bio: "",
      color: avatarColor,
      createdAt: 0,
      name: { firstName: "", lastName: "" },
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
      name: {
        firstName: (value) =>
          value.length < 3 ? "ERR_FIRST_NAME_TOO_SHORT" : null,
        lastName: (value) =>
          value.length < 3 ? "ERR_LAST_NAME_TOO_SHORT" : null,
      },
      username: (value) => (value.length < 3 ? "ERR_USERNAME_TOO_SHORT" : null),
    },
  });

  useEffect(() => {
    if (!router.isReady) return;

    const uuid = Array.isArray(router.query.uuid)
      ? router.query.uuid[0]
      : router.query.uuid;

    if (!uuid) {
      router.back();
      return;
    }

    let isMounted = true;

    const loadProfileForEdit = async () => {
      try {
        const profile = await getProfileFromDatabase(uuid);
        if (!profile) {
          log.error(`Profile with uuid ${uuid} was not found.`);
          router.back();
          return;
        }

        if (isMounted) {
          form.setValues(profile);
          setAvatarColor(profile.color);
        }
      } catch (error) {
        log.error("Failed to load profile for editing. Error:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfileForEdit();

    return () => {
      isMounted = false;
    };
  }, [router.isReady, router.query.uuid]);

  const updateAvatarColor = (color: DefaultMantineColor) => {
    setAvatarColor(color);
    form.setValues({ color });
    form.setDirty({ color: true });
    form.setTouched({ color: true });
  };

  const swatches = useMemo(() => {
    return Object.keys(theme.colors).map((color) => (
      <Tooltip key={color} label={t(`color.${color}`)} withArrow>
        <ColorSwatch
          color={theme.colors[color][6]}
          style={{ cursor: "pointer" }}
          onClick={() => updateAvatarColor(color)}
        >
          {color === avatarColor && (
            <CheckIcon width={15} style={{ color: theme.white }} />
          )}
        </ColorSwatch>
      </Tooltip>
    ));
  }, [theme, avatarColor, t]);

  const handleEdit = () => {
    updateProfileFromDatabase(
      { ...form.values, updatedAt: Date.now() },
      form.values.uuid,
    )
      .then(async () => {
        notifications.show({
          title: t("profile:notifications.updateProfileSuccess.title"),
          message: t("profile:notifications.updateProfileSuccess.text"),
        });

        await refreshProfile();
        void router.push(`/${locale}/profile/all`);
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
    if (!files?.[0]) return;

    const file = files[0];

    resizeAvatarImage({ file })
      .then((resizedBase64) => {
        form.setFieldValue("avatarImage", resizedBase64);
      })
      .catch((error) => {
        log.error("Error resizing the file:", error);
        notifications.show({
          title: t("profile:notifications.resizeAvatarError.title"),
          message: t("profile:notifications.resizeAvatarError.text"),
        });
      });
  };

  const handleImageRejection = (files: FileRejection[]) => {
    if (!files?.length) {
      log.error("Expected one image file, but the file array was empty.");
      return;
    }

    const file = files[0];
    notifications.show({
      autoClose: 20000, // 20 seconds
      title: t(`errors.${file.errors?.[0]?.code}.title`),
      message: t(`errors.${file.errors?.[0]?.code}.message`),
    });
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <DefaultLayout withNavbarOpen>
      <Stack gap="xl" mt="xl">
        <Dropzone
          onDrop={handleFileChange}
          onReject={handleImageRejection}
          maxSize={DEFAULT_AVATAR_FILE_SIZE}
          accept={IMAGE_MIME_TYPE}
          maxFiles={1}
          multiple={false}
        >
          <ProfileAvatar profile={form.values} size="xl" mx="auto" />
        </Dropzone>

        {form.values.avatarImage && (
          <Button onClick={() => form.setFieldValue("avatarImage", undefined)}>
            {t("profile:buttons.resetAvatarImage")}
          </Button>
        )}

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
          <Button variant="default" onClick={() => router.back()}>
            {t("cancel")}
          </Button>
        </Group>
      </Stack>
    </DefaultLayout>
  );
};

export default EditProfilePage;

export const getStaticProps = makeStaticProperties(["common", "profile"]);

export { getStaticPaths } from "@/lib/getStatic";
