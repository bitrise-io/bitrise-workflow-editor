import './StepItem.scss';
import 'react-lazy-load-image-component/src/effects/blur.css';

import StepBadge from '../StepBadge/StepBadge';
import StepItemIcon from './StepItemIcon';
import StepItemTitle from './StepItemTitle';
import StepItemVersion from './StepItemVersion';
import { Step } from '@/models';

type StepItemProps = {
  workflowIndex: number;
  step: Step;
  displayName: string;
  version?: string;
  isSelected: boolean;
  hasVersionUpdate: boolean;
  onSelected: (step: Step, index: number) => void;
};

const tabIndex = (selected: boolean): number => (selected ? -1 : 0);

const StepItem = ({
  workflowIndex,
  step,
  displayName,
  version,
  hasVersionUpdate,
  isSelected,
  onSelected,
}: StepItemProps): JSX.Element => {
  return (
    <button
      type="button"
      aria-label={`Select ${displayName} step`}
      data-e2e-tag="step-item"
      className="step"
      tabIndex={tabIndex(isSelected)}
      onClick={() => onSelected(step, workflowIndex)}
    >
      <StepItemIcon iconUrl={step.iconURL()} />
      <span className="info">
        <strong>
          <StepItemTitle displayName={displayName} />
          <StepBadge isOfficial={step.isOfficial()} isVerified={step.isVerified()} isDeprecated={step.isDeprecated()} />
        </strong>
        <StepItemVersion
          actualVersion={step.version}
          requestedVersion={version || ''}
          hasVersionUpdate={hasVersionUpdate}
        />
      </span>
    </button>
  );
};

export default StepItem;
