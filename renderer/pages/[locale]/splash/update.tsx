import { useTranslation } from "next-i18next";

import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import { Center, Stack, Text } from "@mantine/core";

const SplashUpdatePage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();

  return (
    <Center h="100dvh" w="100dvw">
      <Stack ta="center">
        <Text>{t("lookingForUpdate")}</Text>
        <Text fz="xs">LOCALE={locale}</Text>
      </Stack>
    </Center>
  );
};

export default SplashUpdatePage;

export const getStaticProps = makeStaticProperties(["common"]);

export { getStaticPaths };
