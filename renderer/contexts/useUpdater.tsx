import { createContext, type PropsWithChildren, useContext } from "react";

type UpdaterContextType = {};

type UpdaterProviderProps = UpdaterContextType & PropsWithChildren;

const UpdaterContext = createContext<UpdaterContextType | undefined>(undefined);

/**
 * Provides the updater context to its children components.
 */
export const UpdaterProvider = ({ children }: UpdaterProviderProps) => {
  return (
    <UpdaterContext.Provider value={{}}>{children}</UpdaterContext.Provider>
  );
};

/**
 * Hook to access the updater state and actions.
 */
export const useUpdater = () => {
  const context = useContext(UpdaterContext);

  if (!context) {
    throw new Error("useUpdater must be used within a UpdaterProvider");
  }

  return context;
};
