import { Box, type BoxComponentProps, Skeleton, Title } from "@mantine/core";
import DarkenedText from "./content/DarkenedText";
import type { Profile } from "@/types/profile";
import { useTranslation } from "next-i18next/pages";

type HeaderGreetingProps = BoxComponentProps & {
  firstName: Profile["name"]["firstName"] | undefined;
};

const HeaderGreeting = ({ firstName, ...props }: HeaderGreetingProps) => {
  const { t } = useTranslation(["common"]);

  if (!firstName) {
    return (
      <Box component="header" {...props}>
        <Skeleton height={16} width="50%" radius="xl" />
        <Skeleton height={8} mt={6} width="25%" radius="xl" />
      </Box>
    );
  }

  return (
    <Box component="header" {...props}>
      <Title fz="h1"> {t("greetingText", { FIRST_NAME: firstName })}</Title>
      <DarkenedText>{t("greetingSubtext")}</DarkenedText>
    </Box>
  );
};

export default HeaderGreeting;
