import { Button, Group, Paper, Title, Text } from "@mantine/core";
import { useTranslation } from "next-i18next";
import ProfileAvatar from "@/components/content/ProfileAvatar";
import { IconCamera, IconPhotoUp, IconPhotoX } from "@tabler/icons-react";
import { FileButton } from "@mantine/core";
import { useState, useEffect } from "react";
import resizeAvatarImage from "utils/avatars/resizeAvatarImage";
import log from "electron-log/renderer";
import { UseFormReturnType } from "@mantine/form";
import { Profile } from "types/profile";

const StepThree = ({
  form,
}: {
  form: UseFormReturnType<Profile, (values: Profile) => Profile>;
}) => {
  const { t } = useTranslation();
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

  useEffect(() => {
    handleFileChange(file);
  }, [file, setFile]);

  return (
    <Paper p="lg" withBorder>
      <Title>{t("profile:stepsProfileCreation.avatar.title")}</Title>
      <Text c="dimmed">
        {t("profile:stepsProfileCreation.avatar.description")}
      </Text>
      <ProfileAvatar profile={form.values} size="xl" mt="lg" mx="auto" />
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
          onClick={() => form.setFieldValue("avatarImage", undefined)}
        >
          {t("profile:removePhotoUpload")}
        </Button>
      </Group>
    </Paper>
  );
};

export default StepThree;
