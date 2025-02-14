import type { DefaultMantineColor } from "@mantine/core";
import type Country from "@workmate/country-and-currency/lib/resources/Country";

declare type Profile = {
  avatarImage?: string;
  bio: string;
  color: DefaultMantineColor;
  country?: Country["iso2"];
  createdAt: number;
  isGuestProfile?: boolean;
  name: {
    firstName: string;
    lastName: string;
  };
  username: string;
  updatedAt: number;
  uuid: string;
  // badges?: {
  //  isDeveloper: boolean;
  //  isAlphaUser: boolean;
  //  isBetaUser: boolean;
  //  isProUser: boolean;
  // };
};

/*
 * Profile type used in the lobby page. It includes a `selected` property
 * to indicate if the profile is selected to play a match.
 */
declare type SelectableProfile = Profile & { selected: boolean };
