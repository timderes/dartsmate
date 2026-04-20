import type { Checkout, DartThrow } from "types/match";

export const isWinningThrow = (
  checkoutType: Checkout,
  scoreLeft: number,
  roundTotal: number,
  lastThrow: DartThrow,
): boolean => {
  if (scoreLeft - roundTotal !== 0) return false;

  if (checkoutType === "Single")
    return !lastThrow.isDouble && !lastThrow.isTriple;
  if (checkoutType === "Double")
    return lastThrow.isDouble || lastThrow.isBullseye;
  if (checkoutType === "Triple") return lastThrow.isTriple;

  return true; // "Any" checkout
};
