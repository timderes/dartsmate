import { Center, Loader, Stack } from "@mantine/core";
import { useTranslation } from "next-i18next";
import DarkenedText from "./content/DarkenedText";

const LoadingOverlay = () => {
  const { t } = useTranslation();

  return (
    <Center h="100vh">
      <Stack>
        <Loader mx="auto" type="dots" />
        <DarkenedText fw="bold" fz="sm" tt="uppercase">
          {t("loading")}
        </DarkenedText>
      </Stack>
    </Center>
  );
};

export default LoadingOverlay;
