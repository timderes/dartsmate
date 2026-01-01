import { Badge } from "@mantine/core";
import type { BadgeProps, MantineColor } from "@mantine/core";
import type { MatchStatus } from "types/match";

type BadgeMatchStatusProps = BadgeProps & {
  matchStatus: MatchStatus;
};

const BadgeMatchStatus = ({ matchStatus }: BadgeMatchStatusProps) => {
  const badgeColor: MantineColor = matchStatus === "finished" ? "blue" : "red";

  return <Badge color={badgeColor}>Status: {matchStatus}</Badge>;
};

export default BadgeMatchStatus;
