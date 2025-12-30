import {
  Group,
  Paper,
  Tooltip,
  ColorSwatch,
  CheckIcon,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "next-i18next";
import { useMantineTheme } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { Profile } from "types/profile";

const StepTwo = ({
  form,
}: {
  form: UseFormReturnType<Profile, (values: Profile) => Profile>;
}) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const swatches = Object.keys(theme.colors).map((color) => (
    <Tooltip key={color} label={t(`color.${color}`)} withArrow>
      <ColorSwatch
        color={theme.colors[color][6]}
        style={{ cursor: "pointer" }}
        onClick={() => form.setValues({ color })}
      >
        {color === form.values.color ? (
          <CheckIcon width={15} style={{ color: theme.white }} />
        ) : null}
      </ColorSwatch>
    </Tooltip>
  ));

  return (
    <Paper p="lg" withBorder>
      <Title>{t("profile:stepsProfileCreation.misc.title")}</Title>
      <Text c="dimmed">
        {t("profile:stepsProfileCreation.misc.description")}
      </Text>
      <Group mt="lg">{swatches}</Group>
    </Paper>
  );
};

export default StepTwo;
