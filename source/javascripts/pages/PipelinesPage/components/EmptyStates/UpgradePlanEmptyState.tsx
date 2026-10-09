import { Button } from '@bitrise/bitkit';
import { BitkitEmptyState, IconWorkflowFlow } from '@bitrise/bitkit-v2';

type Props = {
  onUpgrade?: VoidFunction;
};
const UpgradePlanEmptyState = ({ onUpgrade }: Props) => {
  return (
    // The v2 recipe leaves `display` unset, so a stretched empty state centres its own content.
    <BitkitEmptyState
      flex="1"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      data-clarity-unmask="true"
      icon={IconWorkflowFlow}
      headingText="Upgrade your plan to use Pipelines"
      bodyText="Experience enhanced automation and faster builds. Upgrade your plan to create Pipelines using a visual editor."
    >
      {onUpgrade && (
        <Button size="md" onClick={onUpgrade}>
          Upgrade plan
        </Button>
      )}
    </BitkitEmptyState>
  );
};

export default UpgradePlanEmptyState;
