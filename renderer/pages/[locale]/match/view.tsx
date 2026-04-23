import type { NextPage } from "next";
import { useTranslation } from "next-i18next";
import {
  BarChart,
  DonutChart,
  LineChart,
  type DonutChartCell,
} from "@mantine/charts";

import type { Match } from "types/match";
import ProfileAvatar from "@components/content/ProfileAvatar";
import DefaultLayout from "@components/layouts/Default";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";

import getHighestScore from "@/lib/playing/stats/getHighestScore";
import getNumberOfRoundsAboveThreshold from "@/lib/playing/stats/getScoresAbove";
import getMatchAverage from "@/lib/playing/stats/getMatchAverage";
import getFirstNineAverage from "@/lib/playing/stats/getFirstNineAverage";
import getTotalDartsThrown from "@/lib/playing/stats/getTotalDartsThrown";
import { getLocaleDate } from "@utils/misc/getLocalDate";
import getCategorizedThrows from "@/lib/playing/stats/getCategorizedThrows";
import { useSessionStorage } from "@mantine/hooks";
import {
  Group,
  NumberFormatter,
  Stack,
  Table,
  Text,
  Tabs,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconChartHistogram,
  IconCrown,
  IconListNumbers,
  IconUsers,
} from "@tabler/icons-react";

const ViewMatchPage: NextPage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();

  const [matchData] = useSessionStorage<Match>({
    key: "currentMatch",
    defaultValue: undefined,
  });
  const decimalSeparator = Intl.NumberFormat(locale).format(1.1).charAt(1);

  if (!matchData) {
    return (
      <DefaultLayout withNavbarOpen>
        {t("results:errorNoMatchData")}
      </DefaultLayout>
    );
  }

  const rankedPlayers = [...matchData.players].sort(
    (a, b) => a.scoreLeft - b.scoreLeft,
  );
  const isHeadToHead = matchData.players.length === 2;

  const maxRounds = Math.max(0, ...matchData.players.map((player) => player.rounds.length));
  const gameProgressionData = Array.from({ length: maxRounds + 1 }, (_, roundIndex) => {
    const roundPoint: Record<string, number | string> = {
      round: roundIndex,
    };

    matchData.players.forEach((player) => {
      let remainingScore = matchData.initialScore;

      for (let currentRoundIndex = 0; currentRoundIndex < roundIndex; currentRoundIndex += 1) {
        const round = player.rounds[currentRoundIndex];

        if (round && !round.isBust) {
          remainingScore -= round.roundTotal;
        }
      }

      roundPoint[player.username] = remainingScore;
    });

    return roundPoint;
  });

  const score180Label = t("stats.180s");
  const score140Label = t("results:chartLegend.140plus");
  const score100Label = t("results:chartLegend.100plus");
  const scoringMilestonesData = matchData.players.map((player) => ({
    player: player.username,
    [score180Label]: getNumberOfRoundsAboveThreshold(player.rounds, 180),
    [score140Label]: getNumberOfRoundsAboveThreshold(player.rounds, 140),
    [score100Label]: getNumberOfRoundsAboveThreshold(player.rounds, 100),
  }));

  const renderTableRows = rankedPlayers
    .map((player, _idx) => (
      <Table.Tr key={player.uuid}>
        <Table.Td ta="center">
          {_idx === 0 ? (
            <Tooltip
              label={t("match:playerWon", {
                PLAYER_NAME: player.username,
              })}
              withArrow
            >
              <IconCrown color="gold" />
            </Tooltip>
          ) : (
            `${_idx + 1}.`
          )}
        </Table.Td>
        <Table.Td>
          <Group>
            <ProfileAvatar profile={player} />
            {player.username}
          </Group>
        </Table.Td>
        <Table.Td>{player.scoreLeft}</Table.Td>
        <Table.Td>
          <NumberFormatter
            value={getMatchAverage(player.rounds)}
            decimalScale={2}
            decimalSeparator={decimalSeparator}
          />
        </Table.Td>
        <Table.Td>
          <NumberFormatter value={getHighestScore(player.rounds)} />
        </Table.Td>
        <Table.Td>
          <NumberFormatter
            value={getNumberOfRoundsAboveThreshold(player.rounds, 180)}
          />
        </Table.Td>
        <Table.Td>
          <NumberFormatter
            value={getNumberOfRoundsAboveThreshold(player.rounds, 120)}
          />
        </Table.Td>
        <Table.Td>
          <NumberFormatter
            value={getNumberOfRoundsAboveThreshold(player.rounds, 100)}
          />
        </Table.Td>
        <Table.Td>
          <NumberFormatter
            value={getNumberOfRoundsAboveThreshold(player.rounds, 80)}
          />
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <DefaultLayout withNavbarOpen>
      <Title>
        {t("results:title", {
          gameMode: `${matchData.initialScore}-${matchData.matchCheckout}`,
          playerAmount: matchData.players.length,
          count: matchData.players.length,
        })}
      </Title>
      <Text opacity={0.8}>{getLocaleDate(matchData.createdAt)}</Text>
      <Tabs defaultValue="result">
        <Tabs.List>
          <Tabs.Tab leftSection={<IconListNumbers />} value="result">
            {t("results:tabs.title.result")}
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconChartHistogram />} value="charts">
            {t("results:tabs.title.charts")}
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconUsers />} value="playerStats">
            {t("results:tabs.title.playerStats")}
          </Tabs.Tab>
          {isHeadToHead ? (
            <Tabs.Tab leftSection={<IconUsers />} value="headToHead">
              {t("results:tabs.title.headToHead")}
            </Tabs.Tab>
          ) : undefined}
        </Tabs.List>
        <Tabs.Panel value="result">
          <Table striped highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th ta="center">#</Table.Th>
                <Table.Th>{t("lobby:title.players")}</Table.Th>
                <Table.Th>{t("stats.scoreLeft")}</Table.Th>
                <Table.Th>{t("stats.avg")}</Table.Th>
                <Table.Th>{t("stats.highestScore")}</Table.Th>
                <Table.Th>{t("stats.180s")}</Table.Th>
                <Table.Th>120+</Table.Th>
                <Table.Th>100+</Table.Th>
                <Table.Th>80+</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{renderTableRows}</Table.Tbody>
          </Table>
        </Tabs.Panel>
        <Tabs.Panel value="charts">
          <Title>{t("results:chartTitle.gameProgression")}</Title>
          <LineChart
            p="lg"
            h={420}
            data={gameProgressionData}
            dataKey="round"
            series={matchData.players.map((player) => ({
              name: player.username,
              color: player.color,
            }))}
            curveType="step"
            withLegend
            legendProps={{ verticalAlign: "bottom", height: 50 }}
            xAxisLabel={t("stats.rounds")}
            yAxisLabel={t("stats.scoreLeft")}
            yAxisProps={{
              domain: [0, matchData.initialScore],
            }}
          />
          <Title order={3}>{t("results:chartTitle.scoringMilestones")}</Title>
          <BarChart
            mt="md"
            p="lg"
            h={360}
            data={scoringMilestonesData}
            dataKey="player"
            withLegend
            series={[
              { name: score180Label, color: "red" },
              { name: score140Label, color: "orange" },
              { name: score100Label, color: "blue" },
            ]}
          />
        </Tabs.Panel>
        <Tabs.Panel value="playerStats">
          <Tabs defaultValue={matchData.players[0].uuid} orientation="vertical">
            <Tabs.List>
              {matchData.players.map((player) => (
                <Tabs.Tab key={player.uuid} value={player.uuid}>
                  {player.username}
                </Tabs.Tab>
              ))}
            </Tabs.List>
            {matchData.players.map((player) => {
              const categorizedThrows = getCategorizedThrows(player.rounds);

              const data: DonutChartCell[] = [
                {
                  color: "yellow",
                  name: t("stats.singles"),
                  value: categorizedThrows.normals,
                },
                {
                  color: "blue",
                  name: t("stats.doubles"),
                  value: categorizedThrows.doubles,
                },
                {
                  color: "green",
                  name: t("stats.triples"),
                  value: categorizedThrows.triples,
                },

                {
                  color: "red",
                  name: t("stats.missed"),
                  value: categorizedThrows.missed,
                },
              ];

              return (
                <Tabs.Panel key={player.uuid} value={player.uuid}>
                  <Group gap="xl">
                    <DonutChart data={data} chartLabel="" withTooltip={false} />
                    <Stack>
                      {data.map((d) => (
                        <Text key={d.name}>
                          {d.name}: {d.value}
                        </Text>
                      ))}
                    </Stack>
                  </Group>
                </Tabs.Panel>
              );
            })}
          </Tabs>
        </Tabs.Panel>
        {isHeadToHead ? (
          <Tabs.Panel value="headToHead">
            <Table striped highlightOnHover withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("results:headToHead.metric")}</Table.Th>
                  {matchData.players.map((player) => (
                    <Table.Th key={player.uuid}>{player.username}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>{t("results:headToHead.legsWon")}</Table.Td>
                  {matchData.players.map((player) => (
                    <Table.Td key={`legs-${player.uuid}`}>{player.legsWon}</Table.Td>
                  ))}
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>{t("results:headToHead.setsWon")}</Table.Td>
                  {matchData.players.map((player) => (
                    <Table.Td key={`sets-${player.uuid}`}>{player.setsWon}</Table.Td>
                  ))}
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>{t("stats.avg")}</Table.Td>
                  {matchData.players.map((player) => (
                    <Table.Td key={`avg-${player.uuid}`}>
                      <NumberFormatter
                        value={getMatchAverage(player.rounds)}
                        decimalScale={2}
                        decimalSeparator={decimalSeparator}
                      />
                    </Table.Td>
                  ))}
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>{t("stats.firstNineAvg")}</Table.Td>
                  {matchData.players.map((player) => (
                    <Table.Td key={`first-nine-${player.uuid}`}>
                      <NumberFormatter
                        value={getFirstNineAverage(player.rounds)}
                        decimalScale={2}
                        decimalSeparator={decimalSeparator}
                      />
                    </Table.Td>
                  ))}
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>{t("stats.highestScore")}</Table.Td>
                  {matchData.players.map((player) => (
                    <Table.Td key={`highest-${player.uuid}`}>
                      {getHighestScore(player.rounds)}
                    </Table.Td>
                  ))}
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>{t("stats.180s")}</Table.Td>
                  {matchData.players.map((player) => (
                    <Table.Td key={`180s-${player.uuid}`}>
                      {getNumberOfRoundsAboveThreshold(player.rounds, 180)}
                    </Table.Td>
                  ))}
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>{t("stats.dartsThrown")}</Table.Td>
                  {matchData.players.map((player) => (
                    <Table.Td key={`darts-thrown-${player.uuid}`}>
                      {getTotalDartsThrown(player.rounds)}
                    </Table.Td>
                  ))}
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Tabs.Panel>
        ) : undefined}
      </Tabs>
    </DefaultLayout>
  );
};

export default ViewMatchPage;

export const getStaticProps = makeStaticProperties([
  "common",
  "lobby",
  "match",
  "results",
]);

export { getStaticPaths };
