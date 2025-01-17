import type { NextPage } from "next";
import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import { Box, Button, Group, Paper, Stack, Stepper, Text } from "@mantine/core";
import { useTranslation } from "next-i18next";
import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import log from "electron-log/renderer";
import addProfileToDatabase from "@/lib/db/profiles/addProfile";
import { notifications } from "@mantine/notifications";
import formatLocalizedRoute from "utils/navigation/formatLocalizedRoute";
import OnlyControlsLayout, {
  headerHeightOnlyControls,
} from "@/components/layouts/OnlyControlsLayout";
import useProfileForm from "hooks/useProfileForm";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import { modals } from "@mantine/modals";

/**
 *
 *
 */
const CreateProfilePage: NextPage = () => {
  const params = useSearchParams();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const router = useRouter();
  const isGuestProfile = params.get("isGuest") ? true : false;
  const { form } = useProfileForm(isGuestProfile);

  const pageHeight = `calc(100vh - ${headerHeightOnlyControls}px)`;
  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isGuestProfile) {
      window.ipc.setDefaultProfileUUID(form.values.uuid);
    }

    addProfileToDatabase(form.values)
      .then(() => {
        log.info("Successfully added a new profile to the database.");
        void router.push(formatLocalizedRoute({ locale, route: "/" }));
      })
      .catch((err) => {
        log.error("Unable to add a new profile to the database. Error: ", err);
        notifications.show({
          title: t("profile:notifications.createProfileError.title"),
          message: t("profile:notifications.createProfileError.text"),
        });
      });
  };

  const handleCancelProfileCreation = () => {
    modals.openConfirmModal({
      title: t("profile:cancelProfileCreation.title"),
      children: <Text>{t("profile:cancelProfileCreation.text")}</Text>,
      onConfirm: () =>
        void router.push(
          formatLocalizedRoute({ locale, route: "/profileSetupIntro" })
        ),
      labels: {
        confirm: t("confirm"),
        cancel: t("cancel"),
      },
    });
  };

  return (
    <OnlyControlsLayout>
      <Box component="form" h={pageHeight} onSubmit={(e) => handleSubmit(e)}>
        <Stack p="lg" justify="space-between" maw={1200} mx="auto" h="100%">
          <Stepper
            active={active}
            allowNextStepsSelect={false}
            onStepClick={setActive}
          >
            <Stepper.Step label={t("profile:step.label.profile")}>
              <Step1 form={form} />
            </Stepper.Step>
            <Stepper.Step label={t("profile:step.label.misc")}>
              <Step2 form={form} />
            </Stepper.Step>
            <Stepper.Step label={t("profile:step.label.avatar")}>
              <Step3 form={form} />
            </Stepper.Step>
            <Stepper.Completed>
              <Group grow>
                <Button type="submit" disabled={!form.isValid()}>
                  {t("profile:buttons.createProfile")}
                </Button>
                <Button
                  onClick={() => handleCancelProfileCreation()}
                  variant="default"
                >
                  {t("cancel")}
                </Button>
              </Group>
            </Stepper.Completed>
          </Stepper>
          <Paper component={Group} p="xs" withBorder justify="space-between">
            <Button
              variant="default"
              disabled={active === 0}
              onClick={prevStep}
            >
              {t("back")}
            </Button>
            <Button
              disabled={active === 3 || !form.isValid()}
              onClick={nextStep}
            >
              {t("next")}
            </Button>
          </Paper>
        </Stack>
      </Box>
    </OnlyControlsLayout>
  );
};

export default CreateProfilePage;

export const getStaticProps = makeStaticProperties(["common", "profile"]);

export { getStaticPaths };
