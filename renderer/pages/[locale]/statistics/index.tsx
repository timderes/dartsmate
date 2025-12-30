import { useTranslation } from "next-i18next";

import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import DefaultLayout from "@components/layouts/Default";

const StatisticsPage = () => {
  const {
    // t,
    i18n: { language: locale },
  } = useTranslation();

  return (
    <DefaultLayout withNavbarOpen>Statistics Route ({locale})</DefaultLayout>
  );
};

export default StatisticsPage;

export const getStaticProps = makeStaticProperties(["common"]);

export { getStaticPaths };
