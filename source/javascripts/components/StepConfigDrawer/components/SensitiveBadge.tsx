import { Badge, Tooltip } from '@bitrise/bitkit';

const SensitiveBadge = () => {
  return (
    <Tooltip
      shouldWrapChildren
      label="This input holds sensitive information. You can only use secrets to securely reference it."
    >
      <Badge variant="subtle" colorScheme="warning">
        SENSITIVE
      </Badge>
    </Tooltip>
  );
};

export default SensitiveBadge;
