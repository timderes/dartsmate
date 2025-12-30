import { useTranslation } from "next-i18next";

import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import DefaultLayout, { headerHeight } from "@components/layouts/Default";
import getAllMatchesFromDatabase from "@lib/db/matches/getAllMatches";
import { useEffect, useState } from "react";
import type { Match } from "@types/match";
import {
  ActionIcon,
  ActionIconGroup,
  AvatarGroup,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import ProfileAvatar from "@components/content/ProfileAvatar";
import { IconFileUnknown, IconSearch, IconTrash } from "@tabler/icons-react";
import { getLocaleDate } from "@utils/misc/getLocalDate";
import { modals } from "@mantine/modals";
import deleteMatchFromDatabase from "@lib/db/matches/deleteMatch";
import { notifications } from "@mantine/notifications";
import { useSessionStorage } from "@mantine/hooks";
import { useRouter } from "next/router";
import EmptyState from "@components/content/EmptyState";
import SharedConfirmModalProps from "@utils/modals/sharedConfirmModalProps";
import getMatchWinner from "@lib/playing/getMatchWinner";

const HistoryPage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();

  const [matches, setMatches] = useState<Match[] | undefined>(undefined);

  const [, setMatchStorage] = useSessionStorage<Match | undefined>({
    key: "currentMatch",
    defaultValue: undefined,
  });

  const router = useRouter();

  useEffect(() => {
    const getMatches = async () =>
      getAllMatchesFromDatabase().then((matches) => {
        setMatches(matches);
      });

    void getMatches();
  }, []);

  const handleDeleteMatch = (uuid: Match["uuid"]) => {
    modals.openConfirmModal({
      title: t("match:modals.deleteMatchTitle"),
      children: <Text size="sm">{t("match:modals.deleteMatchText")}</Text>,
      labels: {
        confirm: t("confirm"),
        cancel: t("cancel"),
      },
      onConfirm: () => {
        void deleteMatchFromDatabase(uuid).then(() => {
          setMatches((prev) => prev?.filter((match) => match.uuid !== uuid));
          notifications.show({
            title: t("match:notifications.successDeleteMatchTitle"),
            message: t("match:notifications.successDeleteMatchText", {}),
          });
        });
      },
      ...SharedConfirmModalProps,
    });
  };

  const handleOpenMatch = (match: Match) => {
    setMatchStorage(match);
    void router.push(`/${locale}/match/view`);
  };

  const rows = matches?.map((match) => (
    <Table.Tr key={match.uuid}>
      <Table.Td>{getLocaleDate(match.createdAt)}</Table.Td>
      <Table.Td>
        {t("match:displayName", {
          score: match.initialScore,
          checkout: match.matchCheckout,
        })}
      </Table.Td>
      <Table.Td>
        <AvatarGroup>
          {match.players.map((player) => (
            <ProfileAvatar profile={player} />
          ))}
        </AvatarGroup>
      </Table.Td>
      <Table.Td>
        {match.matchStatus === "finished"
          ? t("match:playerWon", {
              PLAYER_NAME: getMatchWinner(match)?.name.firstName,
            })
          : t(`match:matchStatus.${match.matchStatus}`)}
      </Table.Td>
      <Table.Td>
        <ActionIconGroup>
          <ActionIcon>
            <IconSearch onClick={() => handleOpenMatch(match)} />
          </ActionIcon>
          <ActionIcon bg="dark">
            <IconTrash onClick={() => handleDeleteMatch(match.uuid)} />
          </ActionIcon>
        </ActionIconGroup>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <DefaultLayout withNavbarOpen>
      <Stack>
        <Title>{t("routes.history")}</Title>
        {matches?.length !== 0 ? (
          <Table
            horizontalSpacing="sm"
            highlightOnHover
            stickyHeader
            stickyHeaderOffset={headerHeight}
            withTableBorder
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("date")}</Table.Th>
                <Table.Th>{t("match")}</Table.Th>
                <Table.Th>{t("player")}</Table.Th>
                <Table.Th>{t("match:matchResult")}</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        ) : (
          <EmptyState
            ta="center"
            title={t("match:historyEmptyState.title")}
            text={t("match:historyEmptyState.text")}
            icon={
              <IconFileUnknown
                style={{
                  margin: "0 auto",
                  height: 92,
                  width: 92,
                }}
              />
            }
          />
        )}
      </Stack>
    </DefaultLayout>
  );
};

export default HistoryPage;

export const getStaticProps = makeStaticProperties(["common", "match"]);

export { getStaticPaths };
