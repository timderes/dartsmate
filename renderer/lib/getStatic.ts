import type { GetStaticPaths, GetStaticPropsContext } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import i18nConfig from "@/../next-i18next.config";

const { locales, defaultLocale } = i18nConfig.i18n;

export const getI18nPaths = () => {
  return locales.map((locale: string) => ({
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
    ...(await serverSideTranslations(locale, namespaces, i18nConfig)),
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
