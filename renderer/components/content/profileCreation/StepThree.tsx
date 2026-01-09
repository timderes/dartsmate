import { Button, Group, Paper, Title, Text, Modal, Stack } from "@mantine/core";
import { useTranslation } from "next-i18next";
import ProfileAvatar from "@components/content/ProfileAvatar";
import { IconCamera, IconPhotoUp, IconPhotoX } from "@tabler/icons-react";
import { FileButton } from "@mantine/core";
import { useState, useEffect, useRef } from "react";
import resizeAvatarImage from "utils/avatars/resizeAvatarImage";
import log from "electron-log/renderer";
import { UseFormReturnType } from "@mantine/form";
import { Profile } from "types/profile";
import VideoStream from "@components/media/VideoStream";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

const StepThree = ({
  form,
}: {
  form: UseFormReturnType<Profile, (values: Profile) => Profile>;
}) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);

  // Webcam state
  const [opened, { open, close }] = useDisclosure(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      setStream(mediaStream);
      open();
    } catch (err) {
      log.error("Error accessing webcam:", err);
      notifications.show({
        title: t("errors.webcam-not-found.title"),
        message: t("errors.webcam-not-found.message"),
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    close();
  };

  const captureImage = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      // Use actual video dimensions for capture
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Draw the current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob and resize
        canvas.toBlob((blob) => {
          if (blob) {
            resizeAvatarImage({ file: blob })
              .then((resizedBase64) => {
                form.setFieldValue("avatarImage", resizedBase64);
                stopCamera();
              })
              .catch((error) => {
                log.error("Error resizing captured image: ", error);
              });
          }
        }, "image/webp");
      }
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (!reader.result) return;

      resizeAvatarImage({ file: file })
        .then((resizedBase64) => {
          form.setFieldValue("avatarImage", resizedBase64);
        })
        .catch((error) => {
          log.error("Error resizing the file: ", error);
        });
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

      <Modal
        opened={opened}
        onClose={stopCamera}
        title={t("profile:webcam")}
        size="lg"
      >
        <Stack align="center">
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <VideoStream ref={videoRef} stream={stream} muted mirrored />
          </div>
          <Group>
            <Button onClick={stopCamera} variant="default">
              {t("common:cancel")}
            </Button>
            <Button
              onClick={() => captureImage()}
              leftSection={<IconCamera size={16} />}
            >
              {t("common:save")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ProfileAvatar profile={form.values} size="xl" mt="lg" mx="auto" />
      <Group justify="center" mt="lg">
        <Button
          onClick={() => {
            void startCamera();
          }}
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
