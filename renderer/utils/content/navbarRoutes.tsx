import {
  // IconBarbell,
  // IconChartBar,
  IconHistory,
  IconHome,
  IconSettings,
  IconTarget,
  // IconUser,
  IconUsers,
} from "@tabler/icons-react";

/**
 * `navbarRoutes` defines the routes for the application's navigation bar.
 *
 * Note: The `label` values are keys used for looking up translated strings in
 * the app's localization files.
 */
const navbarRoutes = [
  // TODO: Reactivate the disabled routes once their corresponding pages are implemented and functional.
  {
    icon: <IconHome />,
    label: "routes.home",
    route: "/",
  },
  {
    icon: <IconTarget />,
    label: "routes.newMatch",
    route: "/lobby",
  },
  /*
  {
    icon: <IconBarbell />,
    label: "routes.practice",
    route: "/practice",
  },
  */
  {
    icon: <IconHistory />,
    label: "routes.history",
    route: "/history",
  },
  /*
  {
    icon: <IconUser />,
    label: "routes.profile",
    route: "/profile",
  },
  */
  {
    icon: <IconUsers />,
    label: "routes.profiles",
    route: "/profile/all",
  },
  /*
  {
    icon: <IconChartBar />,
    label: "routes.statistics",
    route: "/statistics",
  },
  */
  {
    icon: <IconSettings />,
    label: "routes.settings",
    route: "/settings",
  },
];

export default navbarRoutes;
