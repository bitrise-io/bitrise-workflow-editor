import { EmptyState, Link, Text } from '@bitrise/bitkit';

const TargetBasedEmptyState = () => {
  return (
    <EmptyState
      iconName="Trigger"
      title="An overview of your triggers will appear here"
      maxHeight="208"
      marginBlockEnd="24"
    >
      <Text marginBlockStart="8">
        Start configuring triggers directly in your Workflow or Pipeline settings. With this method, a single Git event
        can execute multiple Workflows or Pipelines.{' '}
        <Link
          colorScheme="purple"
          href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
        >
          Learn more
        </Link>
      </Text>
    </EmptyState>
  );
};

export default TargetBasedEmptyState;
