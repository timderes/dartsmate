import {
  Badge,
  Card,
  Divider,
  Flex,
  Group,
  NumberFormatter,
  Progress,
  Stack,
  Text,
  Tooltip,
  darken,
  getThemeColor,
  lighten,
  rem,
  useMantineTheme,
  type MantineColorScheme,
} from "@mantine/core";
import { useTranslation } from "next-i18next";
import { IconCrown, IconPlayerPlay } from "@tabler/icons-react";
import type { Player } from "types/match";
import ProfileAvatar from "@components/content/ProfileAvatar";
import getFormattedName from "@utils/misc/getFormattedName";
import getFirstNineAverage from "@lib/playing/stats/getFirstNineAverage";
import getHighestScore from "@/lib/playing/stats/getHighestScore";
import getMatchAverage from "@/lib/playing/stats/getMatchAverage";
import getTotalDartsThrown from "@/lib/playing/stats/getTotalDartsThrown";

type MatchPlayerCardProps = {
  player: Player;
  index: number;
  currentPlayerIndex: number;
  currentLegStartingPlayerIndex: number;
  initialScore: number;
  colorScheme: MantineColorScheme;
};

const MatchPlayerCard = ({
  player,
  index,
  currentPlayerIndex,
  currentLegStartingPlayerIndex,
  initialScore,
  colorScheme,
}: MatchPlayerCardProps) => {
  const theme = useMantineTheme();
  const { t } = useTranslation();

  const getCardBackgroundColor = (
    color: string,
    index: number,
  ): string | undefined => {
    if (index === currentPlayerIndex) {
      if (colorScheme === "dark") {
        return darken(getThemeColor(color, theme), 0.7);
      }

      if (colorScheme === "light") {
        return lighten(getThemeColor(color, theme), 0.7);
      }
    }

    return undefined;
  };

  const progressValue = (player.scoreLeft / initialScore) * 100;

  return (
    <Card
      radius={0}
      px={0}
      pb={0}
      m="lg"
      bg={getCardBackgroundColor(player.color, index)}
    >
      {index === currentLegStartingPlayerIndex ? (
        <Tooltip label={t("match:startingPlayer")} withArrow>
          <Badge
            color="teal"
            size="sm"
            pos="absolute"
            right={16}
            top={player.isWinner ? 56 : 16}
            leftSection={<IconPlayerPlay size={14} />}
          >
            {t("match:startingPlayer")}
          </Badge>
        </Tooltip>
      ) : undefined}
      {player.isWinner ? (
        <Tooltip
          label={t("match:playerWon", {
            PLAYER_NAME: player.username,
          })}
          withArrow
        >
          <IconCrown
            style={{
              position: "absolute",
              right: 16,
              top: 16,
            }}
            color="gold"
            size={32}
          />
        </Tooltip>
      ) : undefined}

      <Stack>
        <Group px="lg">
          <ProfileAvatar size="lg" profile={player} />
          <Stack align="start" gap={0}>
            <Text opacity={0.6} fz="xs">
              {getFormattedName(player.name)}
            </Text>
            <Text fz="h2" fw="bold">
              {player.username}
            </Text>
          </Stack>
        </Group>

        <Stack gap={0} ta="center">
          <Text
            c={player.color}
            fw="bold"
            px="lg"
            fz={{ md: rem(40), lg: rem(60), xl: rem(100) }}
          >
            <NumberFormatter value={player.scoreLeft} />
          </Text>
          <Tooltip label={t("stats.avg")} withArrow>
            <Text
              fz="lg"
              style={{
                cursor: "help",
              }}
            >
              <NumberFormatter
                decimalScale={2}
                value={getMatchAverage(player.rounds)}
              />
            </Text>
          </Tooltip>
        </Stack>
        <Divider
          label={t("routes.statistics")}
          color={index === currentPlayerIndex ? player.color : undefined}
        />
        <Flex
          direction={{
            xs: "column",
            xl: "row",
          }}
          tt="uppercase"
          fz="xs"
          px="lg"
          opacity={0.7}
          justify="space-between"
        >
          <span>
            {t("stats.firstNineAvg")}:{" "}
            <NumberFormatter
              decimalScale={2}
              defaultValue={0}
              value={getFirstNineAverage(player.rounds)}
            />
          </span>
          <span>
            {t("stats.highestScore")}:{" "}
            <NumberFormatter
              defaultValue={0}
              value={getHighestScore(player.rounds)}
            />
          </span>
          <span>
            {t("stats.dartsThrown")}: {getTotalDartsThrown(player.rounds)}
          </span>
        </Flex>
        <Progress color={player.color} radius={0} value={progressValue} />
      </Stack>
    </Card>
  );
};

export default MatchPlayerCard;
