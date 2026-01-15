import { useTranslation } from "next-i18next";

import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import useGetAllProfiles from "@/hooks/getAllProfiles";

import DefaultLayout from "@components/layouts/Default";

const ProfileAllPage = () => {
  const { t } = useTranslation();
  const profiles = useGetAllProfiles();


  return <DefaultLayout withNavbarOpen>ProfileAllPage</DefaultLayout>;
};

export default ProfileAllPage;

export const getStaticProps = makeStaticProperties(["common"]);

export { getStaticPaths };
