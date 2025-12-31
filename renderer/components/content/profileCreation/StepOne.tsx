import {
  Group,
  Stack,
  TextInput,
  Textarea,
  Paper,
  Title,
  Text,
  Select,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "next-i18next";
import { Profile } from "types/profile";
import CountryAndCurrency from "@workmate/country-and-currency";

const StepOne = ({
  form,
}: {
  form: UseFormReturnType<Profile, (values: Profile) => Profile>;
}) => {
  const { t } = useTranslation();
  const countries = CountryAndCurrency.getCountries();

  return (
    <Paper p="lg" withBorder>
      <Title>{t("profile:profileCreation.title")}</Title>
      <Text c="dimmed">{t("profile:profileCreation.description")}</Text>
      <Stack my="lg">
        <Group align="flex-start" grow>
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
        <Select
          label={t("country")}
          key={form.key("country")}
          clearable
          leftSection={
            CountryAndCurrency.getCountriesBy(
              "iso2",
              form.getValues().country || "",
            )[0]?.currency.unicode
          }
          data={countries
            .map((country) => ({
              label: t(`countries:countries.${country.iso2.toLowerCase()}`), // Translate the country name
              value: country.iso2, // Use country.iso2 as the value
            }))
            .sort((a, b) => a.label.localeCompare(b.label))} // Sort by label (country name)}
          searchable
          onChange={(value) =>
            form.setValues({
              country: value || "",
            })
          }
        />
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

export default StepOne;
