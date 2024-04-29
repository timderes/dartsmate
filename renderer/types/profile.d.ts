import type { DefaultMantineColor } from "@mantine/core";

declare type Profile = {
  bio: string;
  color: DefaultMantineColor;
  createdAt: number;
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
