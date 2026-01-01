import { Box, Title, Text } from "@mantine/core";
import type { SpaceProps } from "@mantine/core";

type PageHeaderProps = SpaceProps & {
  children: React.ReactNode;
  title: string;
};

const PageHeader = ({ children, title }: PageHeaderProps) => {
  return (
    <Box mb="xl" component="header">
      <Title>{title}</Title>
      <Text>{children}</Text>
    </Box>
  );
};

export default PageHeader;
