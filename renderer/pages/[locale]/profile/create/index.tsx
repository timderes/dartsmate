import type { NextPage } from "next";
import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import { Box, Button, Group, Stack, Stepper, Text } from "@mantine/core";
import { useTranslation } from "next-i18next";
import { createElement, useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import log from "electron-log/renderer";
import addProfileToDatabase from "@/lib/db/profiles/addProfile";
import { notifications } from "@mantine/notifications";
import formatLocalizedRoute from "@utils/navigation/formatLocalizedRoute";
import OnlyControlsLayout from "@/components/layouts/OnlyControlsLayout";
import useProfileForm from "@/hooks/useProfileForm";
import StepOne from "@/components/content/profileCreation/StepOne";

import { modals } from "@mantine/modals";
import StepTwo from "@/components/content/profileCreation/StepTwo";
import StepThree from "@/components/content/profileCreation/StepThree";
import SharedConfirmModalProps from "@utils/modals/sharedConfirmModalProps";
import { headerHeight } from "@/components/layouts/Default";

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

  const pageHeight = `calc(100vh - ${headerHeight}px)`;

  const steps = [
    { label: t("profile:step.label.profile"), step: StepOne },
    { label: t("profile:step.label.misc"), step: StepTwo },
    { label: t("profile:step.label.avatar"), step: StepThree },
  ];

  const isFormValid = form.isValid();

  const [active, setActive] = useState(0);
  const isFirstPage = active === 0;
  const isLastPage = active === steps.length;

  const nextStep = () =>
    setActive((current) => (!isLastPage ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (!isFirstPage ? current - 1 : current));

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
          formatLocalizedRoute({ locale, route: "/profileSetupIntro" }),
        ),
      labels: {
        confirm: t("confirm"),
        cancel: t("cancel"),
      },
      ...SharedConfirmModalProps,
    });
  };

  const validateAndGoToNextPage = () => {
    form.validate();

    if (isFormValid) {
      nextStep();
    }
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
            {steps.map((step, _idx) => (
              <Stepper.Step key={_idx} label={step.label}>
                {createElement(step.step, { form })}
              </Stepper.Step>
            ))}
            <Stepper.Completed>
              <Group grow>
                <Button type="submit" disabled={!isFormValid}>
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
          <Group justify="space-between">
            <Button variant="default" disabled={isFirstPage} onClick={prevStep}>
              {t("back")}
            </Button>
            <Button
              disabled={isLastPage}
              onClick={() => validateAndGoToNextPage()}
            >
              {t("next")}
            </Button>
          </Group>
        </Stack>
      </Box>
    </OnlyControlsLayout>
  );
};

export default CreateProfilePage;

export const getStaticProps = makeStaticProperties([
  "common",
  "countries",
  "profile",
]);

export { getStaticPaths };
