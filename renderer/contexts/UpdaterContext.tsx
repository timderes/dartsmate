import type { UpdateInfo } from "electron-updater";
import { createContext, type PropsWithChildren, useContext } from "react";

export type UpdateStatus =
  | "appIsUpToDate"
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "downloadComplete"
  | "done"
  | "error";

type UpdaterContextType = {
  status: UpdateStatus;
  updateInfo: UpdateInfo | null;
  error: string | null;
  progress: number;
  downloaded: boolean;
};

type UpdaterProviderProps = UpdaterContextType & PropsWithChildren;

const UpdaterContext = createContext<UpdaterContextType | undefined>(undefined);

/**
 * Provides the updater context to its children components.
 */
export const UpdaterProvider = ({
  children,
  downloaded,
  error,
  progress,
  status,
  updateInfo,
}: UpdaterProviderProps) => {
  return (
    <UpdaterContext.Provider
      value={{
        downloaded,
        error,
        progress,
        status,
        updateInfo,
      }}
    >
      {children}
    </UpdaterContext.Provider>
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
