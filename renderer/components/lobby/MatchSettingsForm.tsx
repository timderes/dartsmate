import {
  Flex,
  Group,
  NumberInput,
  Select,
  Stack,
  Tooltip,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconHelpCircleFilled } from "@tabler/icons-react";
import { useTranslation } from "next-i18next";
import { LEGS, MATCH_SCORE, SETS } from "@utils/constants";
import { Match } from "types/match";

type MatchSettingsFormProps = {
  form: UseFormReturnType<Match>;
  readOnly?: boolean;
};

export const MatchSettingsForm = ({
  form,
  readOnly = false,
}: MatchSettingsFormProps) => {
  const { t } = useTranslation();

  return (
    <Stack gap="xs">
      <NumberInput
        label={t("lobby:score")}
        min={MATCH_SCORE.MIN}
        max={MATCH_SCORE.MAX}
        readOnly={readOnly}
        disabled={readOnly}
        {...form.getInputProps("initialScore")}
      />
      <Group grow>
        <NumberInput
          label={
            <Flex align="center" gap="xs">
              <span>{t("set", { count: 2 })}</span>
              <Tooltip label={t("lobby:setsHelpTooltip")} withArrow>
                <IconHelpCircleFilled size={20} style={{ cursor: "help" }} />
              </Tooltip>
            </Flex>
          }
          min={SETS.MIN}
          max={SETS.MAX}
          readOnly={readOnly}
          disabled={readOnly}
          {...form.getInputProps("sets")}
        />
        <NumberInput
          label={
            <Flex align="center" gap="xs">
              <span>{t("leg", { count: 2 })}</span>
              <Tooltip label={t("lobby:legsHelpTooltip")} withArrow>
                <IconHelpCircleFilled size={20} style={{ cursor: "help" }} />
              </Tooltip>
            </Flex>
          }
          min={LEGS.MIN}
          max={LEGS.MAX}
          readOnly={readOnly}
          disabled={readOnly}
          {...form.getInputProps("legs")}
        />
      </Group>
      <Select
        label={t("lobby:checkout")}
        data={["Any", "Single", "Double", "Triple"]}
        readOnly={readOnly}
        disabled={readOnly}
        {...form.getInputProps("matchCheckout")}
      />
    </Stack>
  );
};
