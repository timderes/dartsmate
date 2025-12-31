import SettingsLayout from "@components/layouts/SettingsLayout";
import { type ComboboxData, Select, Stack, Text, Title } from "@mantine/core";

import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import { useTranslation } from "next-i18next";
import i18next from "../../../../next-i18next.config";
import { useEffect } from "react";
import { useRouter } from "next/router";

const colorSchemePage = () => {
  const router = useRouter();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();

  const locals: ComboboxData = i18next.i18n.locales.map((locale) => ({
    label: t(`settings:languages.${locale}`),
    value: locale,
  }));

  useEffect(() => {
    window.ipc.setLocale(locale);
  }, [locale]);

  const handleChangeLanguage = (newLanguage: string) => {
    const newPath = router.pathname.replace("[locale]", newLanguage);
    void router.push(newPath);
  };

  return (
    <SettingsLayout route="language">
      <Stack>
        <Title>{t("settings:language.title")}</Title>
        <Text>{t("settings:language.text")}</Text>
        <Select
          allowDeselect={false}
          label={t("settings:language.title")}
          defaultValue={locale}
          data={locals}
          onChange={(newLanguage) =>
            handleChangeLanguage(newLanguage!)
          }
        />
      </Stack>
    </SettingsLayout>
  );
};

export default colorSchemePage;

export const getStaticProps = makeStaticProperties(["common", "settings"]);

export { getStaticPaths };
