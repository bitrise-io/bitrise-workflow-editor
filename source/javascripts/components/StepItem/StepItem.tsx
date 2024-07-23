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
  isSelected: boolean;
  hasVersionUpdate: boolean;
  onSelected: (step: Step, index: number) => void;
};

const tabIndex = (selected: boolean): number => (selected ? -1 : 0);

const StepItem = ({ workflowIndex, step, hasVersionUpdate, isSelected, onSelected }: StepItemProps): JSX.Element => {
  const displayName = step.displayName();
  const version = step.requestedVersion();

  const isWithGroup = step.cvs === 'with';

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
        {!!version && (
          <StepItemVersion
            actualVersion={step.version}
            requestedVersion={version || ''}
            hasVersionUpdate={hasVersionUpdate}
          />
        )}
        {isWithGroup && <>eee</>}
      </span>
    </button>
  );
};

export default StepItem;
