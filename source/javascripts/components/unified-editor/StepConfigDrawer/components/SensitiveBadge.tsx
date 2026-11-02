import { BitkitBadge, BitkitTooltip } from '@bitrise/bitkit-v2';

const SensitiveBadge = () => {
  return (
    <BitkitTooltip
      text="This input holds sensitive information. You can only use secrets to securely reference it."
      wrapTrigger
    >
      <BitkitBadge colorVariant="yellow">SENSITIVE</BitkitBadge>
    </BitkitTooltip>
  );
};

export default SensitiveBadge;
