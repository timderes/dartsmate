import type { GetStaticPaths, GetStaticPropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import i18next from "../../next-i18next.config.js";

const locales = i18next.i18n.locales;
const defaultLocale = i18next.i18n.defaultLocale;

export const getI18nPaths = () => {
  return locales.map((locale) => ({
    params: {
      locale,
    },
  }));
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    fallback: false,
    paths: getI18nPaths(),
  };
};

export const getI18nProperties = async (
  context: GetStaticPropsContext,
  namespaces: string[] = ["common"],
) => {
  const locale = (context?.params?.locale as string) ?? defaultLocale;

  return {
    ...(await serverSideTranslations(locale, namespaces)),
  };
};

export const makeStaticProperties =
  (
    namespaces: string[] = [],
  ): ((
    context: GetStaticPropsContext,
  ) => Promise<{ props: Record<string, unknown> }>) =>
  async (context: GetStaticPropsContext) => {
    return {
      props: await getI18nProperties(context, namespaces),
    };
  };
