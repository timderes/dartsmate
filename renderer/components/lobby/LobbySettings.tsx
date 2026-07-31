import useLobby from "@/hooks/useLobby";
import { LEGS, MATCH_SCORE, SETS } from "@/utils/constants";
import {
  Checkbox,
  Divider,
  Flex,
  Group,
  NumberInput,
  Select,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconHelpCircleFilled } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import LobbyStartMatchButton from "./LobbyStartMatchButton";

const LobbySettings = (): React.JSX.Element => {
  const { t } = useTranslation(["common"]);
  const { state: lobbyState, dispatch } = useLobby();

  return (
    <Stack gap="md">
      <Title>{t("lobby:title.matchSettings")}</Title>
      <NumberInput
        label={t("lobby:score")}
        min={MATCH_SCORE.MIN}
        max={MATCH_SCORE.MAX}
        onChange={(value) => {
          dispatch({
            type: "UPDATE_MATCH_SETTINGS",
            payload: { initialScore: Number(value) },
          });
        }}
        defaultValue={lobbyState.initialScore}
      />
      <Group grow>
        <NumberInput
          // `count = 2` to force pluralization
          label={
            <Flex align="center" gap="xs">
              <span>{t("set", { count: 2 })}</span>
              <Tooltip label={t("lobby:setsHelpTooltip")} withArrow>
                <IconHelpCircleFilled
                  size={20}
                  style={{
                    cursor: "help",
                  }}
                />
              </Tooltip>
            </Flex>
          }
          min={SETS.MIN}
          max={SETS.MAX}
          onChange={(value) => {
            dispatch({
              type: "UPDATE_MATCH_SETTINGS",
              payload: { sets: Number(value) },
            });
          }}
          defaultValue={lobbyState.sets}
        />
        <NumberInput
          label={
            <Flex align="center" gap="xs">
              <span>{t("leg", { count: 2 })}</span>
              <Tooltip label={t("lobby:legsHelpTooltip")} withArrow>
                <IconHelpCircleFilled
                  size={20}
                  style={{
                    cursor: "help",
                  }}
                />
              </Tooltip>
            </Flex>
          }
          min={LEGS.MIN}
          max={LEGS.MAX}
          onChange={(value) => {
            dispatch({
              type: "UPDATE_MATCH_SETTINGS",
              payload: { legs: Number(value) },
            });
          }}
          defaultValue={lobbyState.legs}
        />
      </Group>
      <Select
        label={t("lobby:checkout")}
        onChange={(value) => {
          dispatch({
            type: "UPDATE_MATCH_SETTINGS",
            payload: { matchCheckout: value! },
          });
        }}
        defaultValue={lobbyState.matchCheckout}
        data={[
          {
            label: t("checkouts.any"),
            value: "Any",
          },
          {
            label: t("checkouts.single"),
            value: "Single",
          },
          {
            label: t("checkouts.double"),
            value: "Double",
          },
          {
            label: t("checkouts.triple"),
            value: "Triple",
          },
        ]}
      />
      <Checkbox
        label={t("lobby:startWithBullOff")}
        onChange={(value) => {
          dispatch({
            type: "UPDATE_MATCH_SETTINGS",
            payload: { startWithBullOff: value.currentTarget.checked },
          });
        }}
        defaultChecked={lobbyState.startWithBullOff}
      />
      <Divider />
      <LobbyStartMatchButton />
    </Stack>
  );
};

export default LobbySettings;
