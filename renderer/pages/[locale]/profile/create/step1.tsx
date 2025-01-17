import {
  Group,
  Stack,
  TextInput,
  Textarea,
  Paper,
  Title,
  Text,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "next-i18next";
import { Profile } from "types/profile";

const Step1 = ({
  form,
}: {
  form: UseFormReturnType<Profile, (values: Profile) => Profile>;
}) => {
  const { t } = useTranslation();

  return (
    <Paper p="lg" withBorder>
      <Title>{t("profile:profileCreation.title")}</Title>
      <Text c="dimmed">{t("profile:profileCreation.description")}</Text>
      <Stack my="lg">
        <Group grow>
          <TextInput
            data-autofocus
            label={t("profile:formLabels.firstName.label")}
            placeholder={t("profile:formLabels.firstName.placeholder")}
            {...form.getInputProps("name.firstName")}
          />
          <TextInput
            label={t("profile:formLabels.lastName.label")}
            placeholder={t("profile:formLabels.lastName.placeholder")}
            {...form.getInputProps("name.lastName")}
          />
        </Group>
        <TextInput
          label={t("profile:formLabels.username.label")}
          placeholder={t("profile:formLabels.username.placeholder")}
          {...form.getInputProps("username")}
        />
        <Textarea
          label={t("profile:formLabels.bio.label")}
          placeholder={t("profile:formLabels.bio.placeholder")}
          {...form.getInputProps("bio")}
        />
      </Stack>
    </Paper>
  );
};

export default Step1;
