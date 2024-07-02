import { Box, Button, Card, Text } from '@bitrise/bitkit';

export type YmlEditorHeaderProps = {
  url: string;
  usesRepositoryYml?: boolean;
};
const YmlEditorHeader = ({ url, usesRepositoryYml }: YmlEditorHeaderProps) => {
  console.log({ usesRepositoryYml });
  return (
    <Box display="flex" gap="16" alignItems="center" marginBlockEnd="24">
      <Text as="h2" alignSelf="flex-start" marginInlineEnd="auto" textStyle="heading/h2">
        Configuration YAML
      </Text>
      {url && (
        <Button as="a" href={url} leftIconName="Download" size="sm" target="_blank" variant="tertiary">
          Download
        </Button>
      )}
      <Card height="40" variant="outline" width="auto">
        Source widget
      </Card>
    </Box>
  );
};

export default YmlEditorHeader;
