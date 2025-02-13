import type { NextPage } from "next";
import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import OnlyControlsLayout from "@/components/layouts/OnlyControlsLayout";
import {
  ActionIcon,
  ComboboxItem,
  Flex,
  Grid,
  Menu,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Title,
} from "@mantine/core";
import { headerHeight } from "@/components/layouts/Default";
import { useTranslation } from "next-i18next";
import {
  CHECKOUTS,
  DEFAULT_MATCH_SETTINGS,
  MATCH_SCORE,
} from "utils/constants";
import {
  IconDeviceFloppy,
  IconFileDownload,
  IconTool,
} from "@tabler/icons-react";
import { Checkout } from "types/match";
import useLobbyForm from "hooks/useLobbyForm";

/**
 *
 */
const NewGamePage: NextPage = () => {
  const { form } = useLobbyForm();
  const { t } = useTranslation();

  const SELECTABLE_CHECKOUTS = CHECKOUTS.map(
    (checkout): ComboboxItem => ({
      label: t(`lobby:gameCheckout.${checkout.toLowerCase()}`),
      value: checkout,
    })
  );

  console.info("FORM", form);

  /**
   *
   */
  const renderPlayerList = (): JSX.Element => {
    return (
      <ScrollArea h={`calc(100vh - ${headerHeight}px)`} type="never" p="xs">
        <Title fz="h5" tt="uppercase">
          {t("lobby:title.players")}
        </Title>
      </ScrollArea>
    );
  };

  /**
   *
   */
  const renderMatchSettings = (): JSX.Element => {
    return (
      <ScrollArea h={`calc(100vh - ${headerHeight}px)`} type="never" p="xs">
        <Stack p="xs">
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
          </Stack>
        </Stack>
      </ScrollArea>
    );
  };

  /**
   *
   */
  return (
    <OnlyControlsLayout>
      <Grid type="container" gutter={0}>
        <Grid.Col span={9}>{renderPlayerList()}</Grid.Col>
        <Grid.Col span="auto">{renderMatchSettings()}</Grid.Col>
      </Grid>
    </OnlyControlsLayout>
  );
};

export default NewGamePage;

export const getStaticProps = makeStaticProperties(["lobby"]);

export { getStaticPaths };
