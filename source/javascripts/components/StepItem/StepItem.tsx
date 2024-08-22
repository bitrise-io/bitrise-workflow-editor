import './StepItem.scss';
import 'react-lazy-load-image-component/src/effects/blur.css';

import { Text } from '@bitrise/bitkit';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { WithBlockData } from '@/core/models/Step';
import { Step } from '@/models';
import defaultStepIcon from '../../../images/step/icon-default.svg';
import StepBadge from '../StepBadge';
import StepItemVersion from './StepItemVersion';

const getWithBlockText = (withBlockData: WithBlockData): string => {
  let withBlockText = '';
  if (withBlockData.image) {
    withBlockText = `In ${withBlockData.image}`;
    const servicesLength = withBlockData.services?.length;
    if (servicesLength) {
      withBlockText += ` with ${servicesLength} service${servicesLength > 1 ? 's' : ''}`;
    }
  }

  return withBlockText;
};

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
      <LazyLoadImage
        wrapperProps={{ style: { flexShrink: 0 } }}
        effect="blur"
        src={step.iconURL() || defaultStepIcon}
      />
      <span className="info">
        <strong>
          <Text data-e2e-tag="step-item__title" className="title" hasEllipsis>
            {displayName}
          </Text>
          <StepBadge isOfficial={step.isOfficial()} isVerified={step.isVerified()} isDeprecated={step.isDeprecated()} />
        </strong>
        {version !== undefined && !step.isStepBundle() && !step.isWithBlock() && (
          <StepItemVersion
            actualVersion={step.version}
            requestedVersion={version || ''}
            hasVersionUpdate={hasVersionUpdate}
          />
        )}
        {step.isWithBlock() && step.withBlockData && (
          <Text color={isSelected ? 'text/on-color' : 'text/secondary'} fontSize="13px" hasEllipsis>
            {getWithBlockText(step.withBlockData)}
          </Text>
        )}
      </span>
    </button>
  );
};

export default StepItem;
