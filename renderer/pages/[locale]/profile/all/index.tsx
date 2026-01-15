import { useTranslation } from "next-i18next";

import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";

import DefaultLayout from "@components/layouts/Default";

const ProfileAllPage = () => {
  const { t } = useTranslation();

  return <DefaultLayout withNavbarOpen>ProfileAllPage</DefaultLayout>;
};

export default ProfileAllPage;

export const getStaticProps = makeStaticProperties(["common"]);

export { getStaticPaths };
