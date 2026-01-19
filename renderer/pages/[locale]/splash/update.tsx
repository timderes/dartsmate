import { useTranslation } from "next-i18next";

import { Center, useMantineTheme, Stack, Text, Progress } from "@mantine/core";

import AnimatedLoaderIcon from "@/components/content/AnimatedLoaderIcon";

import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";

const SplashUpdatePage = () => {
  const theme = useMantineTheme();
  const { t } = useTranslation();

  return (
    <Center h="100dvh" w="100dvw">
      <Stack ta="center">
        <AnimatedLoaderIcon
          color={theme.colors.red[7]}
          style={{
            margin: "auto",
          }}
          width={92}
          height={92}
        />
        <Text>{t("lookingForUpdate")}</Text>
        <Progress value={0} />
      </Stack>
    </Center>
  );
};

export default SplashUpdatePage;

export const getStaticProps = makeStaticProperties(["common"]);

export { getStaticPaths };
