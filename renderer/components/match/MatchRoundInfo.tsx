import { Badge, Flex, Group, NumberFormatter, Text, rem } from "@mantine/core";
import { THROWS_PER_ROUND } from "@utils/constants";
import type { DartThrow } from "types/match";
import type { CheckoutRoute } from "types/CheckoutTable";

type MatchRoundInfoProps = {
  totalRoundScore: number;
  scores: number[];
  matchRound: DartThrow[];
  checkout?: CheckoutRoute;
};

const MatchRoundInfo = ({
  totalRoundScore,
  scores,
  matchRound,
  checkout,
}: MatchRoundInfoProps) => {
  return (
    <>
      <Text
        fz={{ md: rem(40), lg: rem(40), xl: rem(80) }}
        ta="center"
        fw="bold"
      >
        <NumberFormatter value={totalRoundScore} />
      </Text>
      <Group justify="center">
        {Array.from({ length: THROWS_PER_ROUND }, (_, index) => {
          const thrownScore = scores[index];
          const completedThrows = scores.length;

          // Place the checkout options in the remaining slots
          const checkoutIndex = index - completedThrows;
          const checkoutOption = checkout?.[checkoutIndex] ?? undefined;
          const {
            isTriple,
            isDouble,
            dartboardZone: scoreZone,
          } = matchRound[index] ?? {};

          // Format the displayed score based on multiplier
          const displayScore = isTriple
            ? `T${scoreZone}`
            : isDouble
              ? `D${scoreZone}`
              : thrownScore;

          return (
            <Flex align="center" h={60} key={index}>
              {thrownScore ? (
                <Text opacity={0.5}>{displayScore}</Text>
              ) : checkoutOption ? (
                <Badge autoContrast size="xl" radius="xs">
                  {checkoutOption}
                </Badge>
              ) : (
                <Text opacity={0.5}>-</Text>
              )}
            </Flex>
          );
        })}
      </Group>
    </>
  );
};

export default MatchRoundInfo;
