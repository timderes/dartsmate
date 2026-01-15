import { NumberFormatter, Stack, Text } from "@mantine/core";
import type { NumberFormatterProps } from "@mantine/core";

type StatProps = {
  text: string;
  value: number;
} & NumberFormatterProps;

const Stat = ({ text, value, ...props }: StatProps) => {
  return (
    <Stack gap="xs">
      <Text c="dimmed" fz="xs">
        {text}
      </Text>
      <Text fw="bold" ff="mono" fz="xl">
        <NumberFormatter value={value} {...props} />
      </Text>
    </Stack>
  );
};

export default Stat;
