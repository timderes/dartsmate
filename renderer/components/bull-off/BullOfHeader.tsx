import { Text, Title } from "@mantine/core";

type BullOffHeaderProps = {
  helpText: string;
  title: string;
  upperCasedTitle: string;
};

const BullOffHeader = ({
  helpText,
  title,
  upperCasedTitle,
}: BullOffHeaderProps) => {
  return (
    <header>
      <Text fz="md" tt="uppercase" opacity={0.7} style={{ letterSpacing: 4 }}>
        {upperCasedTitle}
      </Text>
      <Title maw={600}>{title}</Title>
      <Text ta="center" c="dimmed" maw={500} mt="lg">
        {helpText}
      </Text>
    </header>
  );
};

export default BullOffHeader;
