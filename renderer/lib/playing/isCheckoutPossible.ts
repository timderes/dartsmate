import type { CheckoutRoute } from "@/types/CheckoutTable";
import type { GameState } from "@/types/GameState";
import { THROWS_PER_ROUND } from "@/utils/constants";
import { DEFAULT_CHECKOUTS } from "@/utils/match/checkouts/default";

import { getTotalRoundScore } from "@/utils/match/stats/getTotalRoundScore";
import { getScores } from "@/utils/match/stats/getTotalRoundScore";

/**
 * Returns the possible checkout route for the current player
 * based on their remaining score and the number of throws left
 * in the current round.
 *
 * Returns `undefined` if no checkout is possible.
 */
const isCheckoutPossible = (state: GameState): CheckoutRoute => {
  const remainingScore =
    state.players[state.currentPlayerIndex].scoreLeft -
    getTotalRoundScore(getScores(state.matchRound));

  const remainingThrows = THROWS_PER_ROUND - state.matchRound.length;

  // TODO: Currently only supports the default checkout table
  // Select a checkout only if the suggested sequence fits the remaining throws
  const checkout = DEFAULT_CHECKOUTS[remainingScore];

  if (!checkout) return undefined;

  // If there aren't enough throws left to complete the suggested checkout,
  // it's not possible this round.
  if (checkout.length > remainingThrows) return undefined;

  return checkout;
};

export default isCheckoutPossible;
