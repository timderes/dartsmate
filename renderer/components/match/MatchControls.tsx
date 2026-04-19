import { Button, Divider, SimpleGrid, Tooltip } from "@mantine/core";
import { useTranslation } from "next-i18next";
import { IconEraser } from "@tabler/icons-react";
import { DARTBOARD_ZONES } from "@utils/constants";

type MatchControlsProps = {
  actions: {
    throwDart: (zone: number) => void;
    undoThrow: () => void;
    toggleMultiplier: (type: "double" | "triple") => void;
    nextTurn: () => void;
  };
  multiplier: {
    double: boolean;
    triple: boolean;
  };
  matchStatus: string;
  matchRoundLength: number;
};

const MatchControls = ({
  actions,
  multiplier,
  matchStatus,
  matchRoundLength,
}: MatchControlsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <SimpleGrid
        cols={{
          xs: 4,
          lg: 3,
        }}
      >
        {DARTBOARD_ZONES.map((zone) => (
          <Button
            onClick={() => actions.throwDart(zone)}
            variant="default"
            key={zone}
          >
            {zone}
          </Button>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={3}>
        <Button
          onClick={() => actions.toggleMultiplier("double")}
          variant={multiplier.double ? undefined : "default"}
        >
          {t("match:multipliers.double")}
        </Button>
        <Button
          onClick={() => actions.toggleMultiplier("triple")}
          variant={multiplier.triple ? undefined : "default"}
        >
          {t("match:multipliers.triple")}
        </Button>
        <Tooltip label={t("match:removeThrows")} withArrow>
          <Button
            disabled={matchRoundLength === 0}
            onClick={() => actions.undoThrow()}
            variant="default"
          >
            <IconEraser />
          </Button>
        </Tooltip>
      </SimpleGrid>
      <Button
        disabled={matchStatus === "finished"}
        onClick={() => actions.nextTurn()}
      >
        {t("match:nextPlayer")}
      </Button>
      <Divider />
    </>
  );
};

export default MatchControls;
