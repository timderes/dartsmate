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

type GameModeCardProps = CardProps & {
  text: string;
  title: string;
};

/**
 * Renders a Card with information about a game mode.
 * Used on the index page to allow the user quickly start a match or
 * training mode.
 */
const GameModeCard = ({ text, title, ...props }: GameModeCardProps) => {
  const { t } = useTranslation();
  return (
    <Card bg="transparent" component={Stack} {...props}>
      <Title fz="lg">{title}</Title>
      <Text fz="sm" opacity={0.8}>
        {text}
      </Text>
      <Button
        leftSection={<IconArrowRight size={16} />}
        size="sm"
        mt="lg"
        w="fit-content"
      >
        {t("playGameMode", { GAME_MODE: title })}
      </Button>
    </Card>
  );
};

export default GameModeCard;
