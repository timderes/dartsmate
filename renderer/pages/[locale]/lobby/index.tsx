import { makeStaticProperties } from "@/lib/getStatic";
import DefaultLayout from "@/components/layouts/Default";
import { Grid } from "@mantine/core";
import LobbySettings from "@/components/lobby/LobbySettings";
import LobbyPlayerList from "@/components/lobby/LobbyPlayerList";

/**
 * The LobbyContent component is responsible for rendering the main content of the lobby page,
 * including the player list and match settings. It uses a grid layout to organize these
 * components side by side.
 */
const LobbyContent = () => {
  return (
    <Grid gap="xs" p="xs">
      <Grid.Col span="auto">
        <LobbyPlayerList />
      </Grid.Col>
      <Grid.Col
        span={{
          base: 4,
          xl: 3,
        }}
      >
        <LobbySettings />
      </Grid.Col>
    </Grid>
  );
};

/**
 * The lobby page is the main entry point for users to configure their match settings and
 * manage players before starting a game.
 */
const LobbyPage = () => {
  return (
    <DefaultLayout withNavbarOpen={false}>
      <LobbyContent />
    </DefaultLayout>
  );
};

export default LobbyPage;

export const getStaticProps = makeStaticProperties(["common", "lobby"]);

export { getStaticPaths } from "@/lib/getStatic";
