import { Tooltip } from '@bitrise/bitkit';
import { BitkitBadge } from '@bitrise/bitkit-v2';

const SensitiveBadge = () => {
  return (
    <Tooltip
      shouldWrapChildren
      label="This input holds sensitive information. You can only use secrets to securely reference it."
    >
      <BitkitBadge variant="subtle" colorVariant="yellow">
        SENSITIVE
      </BitkitBadge>
    </Tooltip>
  );
};

export default SensitiveBadge;
