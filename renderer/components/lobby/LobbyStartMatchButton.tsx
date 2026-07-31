import useLobby from "@/hooks/useLobby";
import { Match } from "@/types/match";
import { Button } from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";
import { useTranslation } from "next-i18next/pages";
import { useRouter } from "next/router";

/**
 * Determines if the match should start with a bull-off based on the match settings
 * and the number of players.
 */
const isBullOffMatch = (match: Match): boolean => {
  const { startWithBullOff, players } = match;

  if (!startWithBullOff || !players) return false;

  const hasMultiplePlayers = players.length > 1;
  return hasMultiplePlayers && startWithBullOff;
};

/**
 * Button and logic to start the match from the lobby. It checks if there are players in the lobby and,
 * if so, triggers the match start process.
 */
const LobbyStartMatchButton = () => {
  const { state: lobbyState } = useLobby();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation(["lobby"]);
  const [, setCurrentMatch] = useSessionStorage<Match>({
    key: "currentMatch",
  });
  const router = useRouter();
  const shouldStartBullOff = lobbyState ? isBullOffMatch(lobbyState) : false;

  /**
   * Save the current lobby state to session storage and navigate to the appropriate match page.
   * If the match is set to start with a bull-off, it navigates to the bull-off page;
   * otherwise, it goes directly to the playing page.
   */
  const handleMatchStart = () => {
    if (!lobbyState) return;

    setCurrentMatch(lobbyState);

    const destination = shouldStartBullOff
      ? `/${locale}/match/bullOff`
      : `/${locale}/match/playing`;

    router.push(destination).catch((err) => {
      console.error(`Failed to navigate to ${destination}:`, err);
    });
  };

  return (
    <Button
      disabled={lobbyState.players.length === 0}
      onClick={() => handleMatchStart()}
      mt="auto"
    >
      {t("lobby:startMatch")}
    </Button>
  );
};
export default LobbyStartMatchButton;
