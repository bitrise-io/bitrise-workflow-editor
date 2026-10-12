import { BitkitBadge, IconCheckCircle, IconErrorCircle, IconWarning } from '@bitrise/bitkit-v2';
import { capitalize } from 'es-toolkit';

type Props = {
  status: 'valid' | 'invalid' | 'warnings';
};

const ICONS = {
  valid: IconCheckCircle,
  invalid: IconErrorCircle,
  warnings: IconWarning,
} as const;

const COLOR_VARIANTS = {
  valid: 'green',
  invalid: 'red',
  warnings: 'yellow',
} as const;

const YmlValidationBadge = ({ status }: Props) => {
  return (
    <BitkitBadge icon={ICONS[status]} colorVariant={COLOR_VARIANTS[status]}>
      {capitalize(status)}
    </BitkitBadge>
  );
};

export default YmlValidationBadge;
