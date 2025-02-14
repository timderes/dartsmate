import {
  ActionIcon,
  Button,
  Checkbox,
  type ComboboxItem,
  Divider,
  Flex,
  Menu,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";

import {
  IconDeviceFloppy,
  IconFileDownload,
  IconTool,
} from "@tabler/icons-react";

import { headerHeight } from "@/components/layouts/Default";
import useLobbyForm from "hooks/useLobbyForm";
import {
  CHECKOUTS,
  DEFAULT_MATCH_SETTINGS,
  MATCH_SCORE,
} from "utils/constants";
import type { Checkout } from "types/match";
import { useTranslation } from "next-i18next";
import { modals } from "@mantine/modals";
import SharedConfirmModalProps from "utils/modals/sharedConfirmModalProps";
import { useRouter } from "next/router";
import { useColorScheme } from "@mantine/hooks";

/**
 * Settings panel for the lobby.
 */
const LobbySettings = (): JSX.Element => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation(["common", "lobby"]);
  const { form } = useLobbyForm();
  const router = useRouter();
  const SELECTABLE_CHECKOUTS = CHECKOUTS.map(
    (checkout): ComboboxItem => ({
      label: t(`lobby:gameCheckout.${checkout.toLowerCase()}`),
      value: checkout,
    })
  );

  const handleAbortLobby = () =>
    modals.openConfirmModal({
      title: t("lobby:modalAbortLobby:title"),
      children: <Text size="sm">{t("lobby:modalAbortLobby:text")}</Text>,
      labels: {
        confirm: t("confirm"),
        cancel: t("cancel"),
      },
      onConfirm: () => {
        void router.push(`/${locale}/`);
      },
      ...SharedConfirmModalProps,
    });

  return (
    <ScrollArea h={`calc(100vh - ${headerHeight}px)`} type="never">
      <Stack h={`calc(100vh - ${headerHeight}px)`} p="md">
        <Flex align="center" justify="space-between">
          <Title fz="h5" tt="uppercase">
            {t("lobby:title.matchSettings")}
          </Title>
          <Menu shadow="md" withArrow arrowPosition="center">
            <Menu.Target>
              <ActionIcon>
                <IconTool />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconFileDownload size={14} />}>
                {t("lobby:loadPreviousMatchSettings")}
              </Menu.Item>
              <Menu.Item leftSection={<IconDeviceFloppy size={14} />}>
                {t("lobby:saveMatchSettings")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
        <Stack>
          <NumberInput
            variant="filled"
            label={t("lobby:score")}
            allowNegative={false}
            defaultValue={DEFAULT_MATCH_SETTINGS.SCORE}
            min={MATCH_SCORE.MIN}
            max={MATCH_SCORE.MAX}
            key={form.key("initialScore")}
            {...form.getInputProps("initialScore", { type: "input" })}
          />
          <Select
            variant="filled"
            label={t("lobby:checkout")}
            defaultValue={"Double" as Checkout}
            data={SELECTABLE_CHECKOUTS}
            comboboxProps={{
              transitionProps: { transition: "pop", duration: 200 },
            }}
            allowDeselect={false}
            key={form.key("matchCheckout")}
            {...form.getInputProps("matchCheckout", { type: "checkbox" })}
          />
          <NumberInput
            variant="filled"
            label={t("sets", {
              count: 2 /* Hardcoded count to 2 to force pluralization, regardless of actual value. */,
            })}
            defaultValue={1}
            min={1}
            disabled
          />
          <NumberInput
            variant="filled"
            label={t("legs", {
              count: 2 /* Hardcoded count to 2 to force pluralization, regardless of actual value. */,
            })}
            defaultValue={1}
            min={1}
            disabled
          />
          <Divider label={t("lobby:miscSettings")} labelPosition="left" />
          <Checkbox label={t("lobby:enableTeamGame")} disabled />
          <Checkbox
            checked={true}
            label={t("lobby:enableStatistics")}
            disabled
          />
          <Checkbox label={t("lobby:enableAiOpponents")} disabled />
        </Stack>
        <Divider mt="auto" />
        <Button onClick={() => handleAbortLobby()} variant="default">
          {t("cancel")}
        </Button>
        <Button>{t("lobby:startMatch")}</Button>
      </Stack>
    </ScrollArea>
  );
};

export default LobbySettings;
