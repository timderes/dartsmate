import type { NextPage } from "next";
import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import OnlyControlsLayout from "@/components/layouts/OnlyControlsLayout";
import {
  ActionIcon,
  Button,
  ComboboxItem,
  Divider,
  Flex,
  Grid,
  Menu,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Text,
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
import { modals } from "@mantine/modals";
import SharedConfirmModalProps from "utils/modals/sharedConfirmModalProps";
import { useRouter } from "next/router";
import getAllProfilesFromDatabase from "@/lib/db/profiles/getAllProfiles";
import { useCallback, useEffect } from "react";
import type { SelectableProfile } from "types/profile";
import { useListState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

/**
 *
 */
const NewGamePage: NextPage = () => {
  const { form } = useLobbyForm();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const router = useRouter();

  const SELECTABLE_CHECKOUTS = CHECKOUTS.map(
    (checkout): ComboboxItem => ({
      label: t(`lobby:gameCheckout.${checkout.toLowerCase()}`),
      value: checkout,
    })
  );

  const [profiles, profilesActions] = useListState<SelectableProfile>([]);

  const getAllProfiles = useCallback(() => {
    getAllProfilesFromDatabase()
      .then((profiles) => {
        profiles.forEach((profile) => {
          // Prevent duplicates from being added
          if (profiles.includes(profile)) return;

          profilesActions.append({ ...profile, selected: false });
        });
      })
      .catch((err) => {
        notifications.show({
          title: t("error"),
          message: t("lobby:errorFetchingProfiles", { error: err as string }),
        });
      });
  }, [profiles]);

  useEffect(() => {
    void getAllProfiles();
  }, []);

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

  const profilesList = profiles.map((profile, idx) => (
    <Draggable key={profile.uuid} index={idx} draggableId={profile.uuid}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Text>{profile.username}</Text>

          <Text>{profile.uuid}</Text>
        </div>
      )}
    </Draggable>
  ));

  /**
   *
   */
  const renderPlayerList = (): JSX.Element => {
    return (
      <ScrollArea h={`calc(100vh - ${headerHeight}px)`} type="never" p="xs">
        <Title fz="h5" tt="uppercase">
          {t("lobby:title.players")}
        </Title>
        <DragDropContext
          onDragEnd={({ destination, source }) =>
            profilesActions.reorder({
              from: source.index,
              to: destination?.index || 0,
            })
          }
        >
          <Droppable droppableId="dnd-list" direction="vertical">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {profilesList}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ScrollArea>
    );
  };

  /**
   *
   */
  const renderMatchSettings = (): JSX.Element => {
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

export const getStaticProps = makeStaticProperties(["common", "lobby"]);

export { getStaticPaths };
