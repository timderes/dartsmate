import type { GetStaticProps, NextPage } from "next";

import DefaultLayout from "@/components/layouts/Default";
import { Select } from "@mantine/core";
import { useRouter } from "next/router";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useLocalStorage } from "@mantine/hooks";

const SettingsPage: NextPage = () => {
  const { locale, locales, push } = useRouter();
  const { t } = useTranslation(["settingsPage"]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [language, setLanguage] = useLocalStorage<string>({
    key: "app-language",
  });

  const handleLocaleChange = (selectedLocale: string) => {
    if (selectedLocale !== locale) {
      setLanguage(selectedLocale);
      void push("/settings", undefined, { locale: selectedLocale });
    }
  };

  return (
    <DefaultLayout>
      <h1>{t("pageTitle")}</h1>
      <h2>{t("pageSectionTitleLanguage")}</h2>
      <Select
        label={t("languageSelectLabel")}
        placeholder={locale}
        data={locales as string[]}
        defaultValue={locale}
        onChange={handleLocaleChange}
      />
    </DefaultLayout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", [
      "common",
      "settingsPage",
    ])),
  },
});

export default SettingsPage;
