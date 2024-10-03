import { Box, Input, Notification, TagsInput, Text } from '@bitrise/bitkit';
import useNavigation from '@/hooks/useNavigation';

type WithBlockPanelProps = {
  groupName: string;
  imageName: string;
  services: string[];
};

const WithBlockHeader = ({ title }: { title: string }) => (
  <Box as="header" px="24" pt="16">
    <Text as="h3" textStyle="heading/h3">
      {title}
    </Text>
  </Box>
);

const WithBlockContent = ({ imageName, services }: { imageName: string; services: string[] }) => {
  const { replace } = useNavigation();

  return (
    <Box padding="24">
      {!!imageName && (
        <Input
          isRequired
          isReadOnly
          label="Image"
          inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
          marginBlockEnd="24"
          value={imageName}
        />
      )}
      {services && services.length > 0 && (
        <TagsInput
          isReadOnly
          label="Service"
          isRequired
          marginBlockEnd="24"
          value={services}
          onNewValues={() => {}}
          onRemove={() => {}}
        />
      )}
      <Notification
        action={{
          label: 'Go to YAML page',
          onClick: () => replace('/yml'),
        }}
        status="info"
      >
        <Text textStyle="comp/notification/title">Edit container or service configuration</Text>
        <Text textStyle="comp/notification/message">
          View more details or edit the container or service configuration on the Configuration YAML page.
        </Text>
      </Notification>
    </Box>
  );
};

const WithGroupPanel = ({ groupName, imageName, services }: WithBlockPanelProps) => {
  return (
    <Box display="flex" flexDirection="column" gap="8">
      <WithBlockHeader title={groupName} />
      <WithBlockContent imageName={imageName} services={services} />
    </Box>
  );
};

export { WithBlockPanelProps, WithBlockHeader, WithBlockContent };

export default WithGroupPanel;
