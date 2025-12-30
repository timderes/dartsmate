import SettingsLayout from "@components/layouts/SettingsLayout";
import {
  Center,
  isMantineColorScheme,
  SegmentedControl,
  type SegmentedControlProps,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import { useTranslation } from "next-i18next";
import getDefaultIconSize from "utils/misc/getDefaultIconSize";
import log from "electron-log/renderer";

const colorSchemePage = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { t } = useTranslation();

  const colorSchemesOptions: SegmentedControlProps["data"] = [
    {
      value: "light",
      label: (
        <Center style={{ gap: 10 }}>
          <IconSun style={getDefaultIconSize()} />
          <span>{t("settings:colorSchemes.light")}</span>
        </Center>
      ),
    },
    {
      value: "dark",
      label: (
        <Center style={{ gap: 10 }}>
          <IconMoon style={getDefaultIconSize()} />
          <span>{t("settings:colorSchemes.dark")}</span>
        </Center>
      ),
    },
    {
      value: "auto",
      label: (
        <Center style={{ gap: 10 }}>
          <IconDeviceDesktop style={getDefaultIconSize()} />
          <span>{t("settings:colorSchemes.auto")}</span>
        </Center>
      ),
    },
  ];

  /*
   * Updates the application color scheme based on the provided scheme.
   *
   * This function first validates if the provided color scheme is one
   * of the allowed Mantine color schemes ('light', 'dark', 'auto').
   */
  const handleChangeColorScheme = (newScheme: string): void => {
    const isValidScheme = isMantineColorScheme(newScheme);

    if (isValidScheme) {
      setColorScheme(newScheme);
      return;
    }
    log.error("A invalid color scheme was provided:", newScheme);
  };

  return (
    <SettingsLayout route="colorScheme">
      <Stack>
        <Title>{t("settings:colorScheme.title")}</Title>
        <Text>{t("settings:colorScheme.text")}</Text>
        <SegmentedControl
          data={colorSchemesOptions}
          defaultValue={colorScheme}
          onChange={(newScheme) => handleChangeColorScheme(newScheme)}
        />
      </Stack>
    </SettingsLayout>
  );
};

export default colorSchemePage;

export const getStaticProps = makeStaticProperties(["common", "settings"]);

export { getStaticPaths };
