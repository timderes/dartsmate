import { DATE_OPTIONS } from "@/utils/constants";

export const getLocaleDate = (timestamp: number) => {
  const date = new Date(timestamp);

  return date.toLocaleDateString(undefined, DATE_OPTIONS);
};
