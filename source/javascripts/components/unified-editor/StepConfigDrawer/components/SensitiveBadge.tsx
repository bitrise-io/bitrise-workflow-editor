import { BitkitBadge } from '@bitrise/bitkit-v2';

import LabelTooltip from '@/components/LabelTooltip';

const SensitiveBadge = () => {
  return (
    <LabelTooltip
      text="This input holds sensitive information. You can only use secrets to securely reference it."
      wrapTrigger
    >
      <BitkitBadge colorVariant="yellow">SENSITIVE</BitkitBadge>
    </LabelTooltip>
  );
};

export default SensitiveBadge;
