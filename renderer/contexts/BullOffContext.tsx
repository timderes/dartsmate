import type { BullOffState } from "@/hooks/useBullOff";
import { createContext } from "react";

const BullOffContext = createContext<BullOffState | null>(null);

export default BullOffContext;
