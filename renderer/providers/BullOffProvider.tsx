import BullOffContext from "@/contexts/BullOffContext";
import useBullOff from "@/hooks/useBullOff";
import type { PropsWithChildren } from "react";

const BullOffProvider = ({ children }: PropsWithChildren) => {
  const value = useBullOff();

  return (
    <BullOffContext.Provider value={value}>{children}</BullOffContext.Provider>
  );
};

export default BullOffProvider;
