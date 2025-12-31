import { useTranslation } from "next-i18next";

import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import DefaultLayout from "@components/layouts/Default";

const PracticePage = () => {
  const {
    // t,
    i18n: { language: locale },
  } = useTranslation();

  return (
    <DefaultLayout withNavbarOpen>Practice Route ({locale})</DefaultLayout>
  );
};

export default PracticePage;

export const getStaticProps = makeStaticProperties(["common"]);

export { getStaticPaths };
