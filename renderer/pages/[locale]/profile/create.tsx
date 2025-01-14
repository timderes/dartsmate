import type { NextPage } from "next";
import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import {
  Box,
  Button,
  CheckIcon,
  ColorSwatch,
  DefaultMantineColor,
  FileButton,
  Group,
  Paper,
  Stack,
  Stepper,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "next-i18next";
import { FormEvent, useEffect, useState } from "react";
import { v4 as getUUID } from "uuid";
import { useRouter } from "next/router";
import type { Profile } from "types/profile";
import ProfileAvatar from "@/components/content/ProfileAvatar";
import resizeAvatarImage from "utils/avatars/resizeAvatarImage";
import OnlyControlsLayout, {
  headerHeightOnlyControls,
} from "@/components/layouts/OnlyControlsLayout";
import {
  IconCamera,
  IconForms,
  IconPhotoUp,
  IconPhotoX,
  IconUserCircle,
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import log from "electron-log/renderer";
import addProfileToDatabase from "@/lib/db/profiles/addProfile";
import { notifications } from "@mantine/notifications";
import formatLocalizedRoute from "utils/navigation/formatLocalizedRoute";

const CreateProfilePage: NextPage = () => {
  const params = useSearchParams();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const theme = useMantineTheme();
  const router = useRouter();
  const userUUID = getUUID();

  const [avatarColor, setAvatarColor] = useState<DefaultMantineColor>(
    theme.primaryColor
  );

  const isGuestProfile = params.get("isGuest") ? true : false;

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
      // Error messages are currently not used. The form only proceeds if all fields are valid.
      name: {
        firstName: (value) =>
          value.length < 3 ? "ERR_FIRST_NAME_TO_SHORT" : null,
        lastName: (value) =>
          value.length < 3 ? "ERR_LAST_NAME_TO_SHORT" : null,
      },
      username: (value) => (value.length < 3 ? "ERR_USERNAME_TO_SHORT" : null),
    },
  });

  // Manually update the color, since the ...props method doesn't work on the color swatches
  const updateAvatarColor = (color: DefaultMantineColor) => {
    setAvatarColor(color);
    form.setValues({
      color: color,
    });
  };
  const [file, setFile] = useState<File | null>(null);
  const handleFileChange = (file: File | null) => {
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

  const pageHeight = `calc(100vh - ${headerHeightOnlyControls}px)`;

  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));
  const stepIconsStyles = { width: rem(18), height: rem(18) };

  const renderStepHeader = (title: string, description: string) => {
    return (
      <Paper p="lg" withBorder>
        <Title>{t(title)}</Title>
        <Text c="dimmed">{t(description)}</Text>
      </Paper>
    );
  };

  useEffect(() => {
    handleFileChange(file);
  }, [file, setFile]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    /*
     * Update the app's default profile UUID only if the current
     * profile is not a guest profile.
     */
    if (!isGuestProfile) {
      window.ipc.setDefaultProfileUUID(form.values.uuid);
    }

    addProfileToDatabase(form.values)
      .then(() => {
        log.info(
          "Created Profile with these values:",
          JSON.stringify(form.values)
        );
        void router.push(formatLocalizedRoute({ locale, route: "/" }));
      })
      .catch((err) => {
        log.error("Error creating profile:", err);

        notifications.show({
          title: t("profile:notifications.createProfileError.title"),
          message: t("profile:notifications.createProfileError.text"),
        });
      });
  };
  return (
    <OnlyControlsLayout>
      <Box component="form" h={pageHeight} onSubmit={(e) => handleSubmit(e)}>
        <Stack p="lg" justify="space-between" maw={1200} mx="auto" h="100%">
          <Stepper
            active={active}
            allowNextStepsSelect={false}
            onStepClick={setActive}
          >
            <Stepper.Step
              icon={<IconForms style={stepIconsStyles} />}
              label={t("profile:step.label.profile")}
            >
              {renderStepHeader(
                "profile:profileCreation.title",
                "profile:profileCreation.description"
              )}
              <Stack my="lg">
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
              </Stack>
            </Stepper.Step>
            <Stepper.Step label={t("profile:step.label.misc")}>
              {renderStepHeader(
                "profile:stepsProfileCreation.misc.title",
                "profile:stepsProfileCreation.misc.description"
              )}
              <Group mt="lg">{swatches}</Group>
            </Stepper.Step>
            <Stepper.Step
              icon={<IconUserCircle style={stepIconsStyles} />}
              label={t("profile:step.label.avatar")}
            >
              {renderStepHeader(
                "profile:stepsProfileCreation.avatar.title",
                "profile:stepsProfileCreation.avatar.description"
              )}
              <ProfileAvatar
                profile={form.values}
                size="xl"
                mt="lg"
                mx="auto"
              />
              <Group justify="center" mt="lg">
                <Button
                  disabled
                  leftSection={<IconCamera stroke={1.5} />}
                  variant="default"
                >
                  {t("profile:webcam")}
                </Button>
                <FileButton
                  onChange={setFile}
                  accept="image/png,image/jpeg"
                  aria-label={t("profile:photoUpload")}
                  multiple={false}
                >
                  {(props) => (
                    <Button
                      {...props}
                      leftSection={<IconPhotoUp stroke={1.5} />}
                      variant="default"
                    >
                      {t("profile:photoUpload")}
                    </Button>
                  )}
                </FileButton>
                <Button
                  variant="default"
                  leftSection={<IconPhotoX stroke={1.5} />}
                  disabled={!form.values.avatarImage}
                  onClick={() =>
                    void form.setFieldValue("avatarImage", undefined)
                  }
                >
                  {t("profile:removePhotoUpload")}
                </Button>
              </Group>
            </Stepper.Step>
            <Stepper.Completed>
              <Group grow>
                <Button type="submit" disabled={!form.isValid()}>
                  {t("profile:buttons.createProfile")}
                </Button>
                <Button
                  variant="default"
                  onClick={() => void router.push(`/${locale}/welcome`)}
                >
                  {t("cancel")}
                </Button>
              </Group>
            </Stepper.Completed>
          </Stepper>
          <Paper component={Group} p="xs" withBorder justify="space-between">
            <Button
              variant="default"
              disabled={active === 0}
              onClick={prevStep}
            >
              {t("back")}
            </Button>
            <Button
              disabled={active === 3 || !form.isValid()}
              onClick={nextStep}
            >
              {t("next")}
            </Button>
          </Paper>
        </Stack>
      </Box>
    </OnlyControlsLayout>
  );
};

export default CreateProfilePage;

export const getStaticProps = makeStaticProperties(["common", "profile"]);

export { getStaticPaths };
