import { Center, Loader, Stack, Text } from "@mantine/core";
import { useTranslation } from "next-i18next";

const LoadingOverlay = () => {
  const { t } = useTranslation();

  return (
    <Center h="100vh">
      <Stack>
        <Loader mx="auto" type="dots" />
        <Text c="dimmed" fw="bold" fz="sm" tt="uppercase">
          {t("loading")}
        </Text>
      </Stack>
    </Center>
  );
};

export default LoadingOverlay;
