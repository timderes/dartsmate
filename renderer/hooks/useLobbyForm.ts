import { useForm } from "@mantine/form";

import { v4 as getUUID } from "uuid";
import type { Match } from "types/match";
import { APP_VERSION } from "utils/constants";

/**
 *
 */
const useLobbyForm = () => {
  const matchUUID = getUUID();

  const form = useForm<Match>({
    initialValues: {
      appVersion: APP_VERSION,
      createdAt: Date.now(),
      initialScore: 501,
      players: [],
      matchCheckout: "Double",
      matchStatus: "started",
      updatedAt: Date.now(),
      uuid: matchUUID,
    },
    validate: {},
  });

  return { form };
};

export default useLobbyForm;
