import { Button, List, Stack, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useTranslation } from "next-i18next";
import { APP_VERSION } from "@/utils/constants";

const ChangelogModal = () => {
  const { t } = useTranslation("changelog");

  const features = t(`versions.${APP_VERSION}.features`, {
    returnObjects: true,
  });
  const fixes = t(`versions.${APP_VERSION}.fixes`, { returnObjects: true });

  const hasFeatures = Array.isArray(features) && features.length > 0;
  const hasFixes = Array.isArray(fixes) && fixes.length > 0;
  const hasContent = hasFeatures || hasFixes;

  return (
    <Stack>
      {hasContent ? (
        <>
          {hasFeatures && (
            <div>
              <Title order={5} mb="xs">
                {t("features")}
              </Title>
              <List>
                {(features as string[]).map((feature, index) => (
                  <List.Item key={index}>{feature}</List.Item>
                ))}
              </List>
            </div>
          )}
          {hasFixes && (
            <div>
              <Title order={5} mb="xs">
                {t("fixes")}
              </Title>
              <List>
                {(fixes as string[]).map((fix, index) => (
                  <List.Item key={index}>{fix}</List.Item>
                ))}
              </List>
            </div>
          )}
        </>
      ) : (
        <Text fs="italic">{t("noChangelog")}</Text>
      )}
      <Button w="fit-content" onClick={() => modals.close("changelog-modal")}>
        {t("common:next")}
      </Button>
    </Stack>
  );
};

export default ChangelogModal;
