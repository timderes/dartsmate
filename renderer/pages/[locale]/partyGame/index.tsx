import type { NextPage } from "next";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import DefaultLayout from "@/components/layouts/Default";
import PageHeader from "@/components/content/PageHeader";

/**
 * Renders a list of mini-games that users can play. This page serves as a hub for all
 * available mini-games, allowing users to select and launch their desired game.
 */
const MiniGameListPage: NextPage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const router = useRouter();

  return (
    <DefaultLayout withNavbarOpen>
      <PageHeader title={t("routes.partyGames")}>
        {t("partyGames:description")}
      </PageHeader>
    </DefaultLayout>
  );
};

export default MiniGameListPage;

export const getStaticProps = makeStaticProperties(["common", "partyGames"]);

export { getStaticPaths };
