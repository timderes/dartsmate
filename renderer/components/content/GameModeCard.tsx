import {
  Button,
  Card,
  type CardProps,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import type GameMode from "types/GameMode";
import formatLocalizedRoute from "utils/navigation/formatLocalizedRoute";

type GameModeCardProps = CardProps & {
  gameMode: GameMode;
};

/**
 * Renders a Card with information about a game mode.
 * Used on the index page to allow the user quickly start a match or
 * training mode.
 */
const GameModeCard = ({ gameMode, ...props }: GameModeCardProps) => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const router = useRouter();

  return (
    <Card bg="transparent" component={Stack} {...props}>
      <Title fz="lg"> {t(gameMode.title)}</Title>
      <Text fz="sm" opacity={0.8}>
        {t(gameMode.text)}
      </Text>
      <Button
        leftSection={<IconArrowRight size={16} />}
        disabled={!gameMode.isActive}
        size="sm"
        mt="lg"
        w="fit-content"
        onClick={() =>
          void router.push(
            formatLocalizedRoute({ locale, route: gameMode.setupRoute }),
          )
        }
      >
        {t("playGameMode", { GAME_MODE: t(gameMode.title) })}
      </Button>
    </Card>
  );
};

export default GameModeCard;
