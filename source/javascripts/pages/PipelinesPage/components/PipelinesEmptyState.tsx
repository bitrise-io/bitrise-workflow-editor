import { Button, EmptyState } from '@bitrise/bitkit';
import useNavigation from '../../../hooks/useNavigation';

const PipelinesEmptyState = () => {
  const { replace } = useNavigation();

  return (
    <EmptyState
      flex="1"
      iconName="WorkflowFlow"
      title="Your Pipeline will appear here"
      description="After you have created a Pipeline, you will be able view it. You can create a Pipeline in the YML editor."
    >
      <Button variant="secondary" size="md" rightIconName="ArrowNorthEast" onClick={() => replace('/yml')}>
        View configuration YAML
      </Button>
    </EmptyState>
  );
};

export default PipelinesEmptyState;
