import { Badge } from '@bitrise/bitkit';
import { capitalize } from 'es-toolkit';

type Props = {
  status: 'valid' | 'invalid' | 'warnings';
};

const ICON_NAMES = {
  valid: 'CheckCircle',
  invalid: 'ErrorCircle',
  warnings: 'Warning',
} as const;

const COLOR_SCHEMES = {
  valid: 'positive',
  invalid: 'negative',
  warnings: 'warning',
} as const;

const YmlValidationBadge = ({ status }: Props) => {
  return (
    <Badge iconName={ICON_NAMES[status]} colorScheme={COLOR_SCHEMES[status]}>
      {capitalize(status)}
    </Badge>
  );
};

export default YmlValidationBadge;
