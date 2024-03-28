import { Box, Icon, Text } from '@bitrise/bitkit';
import classNames from 'classnames';

import stepOutDatedIcon from '../../../images/step/upgrade.svg';
import { OnStepChange, Step, StepVersionWithRemark } from '../../models';
import { getVersionRemark } from '../../utils/stepVersionUtil';

type Props = {
  step: Step;
  resolvedVersion: string;
  latestVersion: string;
  hasVersionUpdate: boolean;
  versionsWithRemarks: Array<StepVersionWithRemark>;
  onChange: OnStepChange;
};

type DangerouslySetInnerHTMLProps = { __html: string };
const html = (text: string): DangerouslySetInnerHTMLProps => ({ __html: text });

const StepVersionDetails = ({
  step,
  resolvedVersion,
  latestVersion,
  hasVersionUpdate,
  versionsWithRemarks = [],
  onChange,
}: Props) => {
  const getStepVersionText = () => {
    if (!step.isConfigured()) {
      return 'Invalid version';
    }

    if (step.isVCSStep()) {
      return `Branch: ${resolvedVersion}`;
    }

    return `Version: ${resolvedVersion}`;
  };

  return (
    <section className="version" data-e2e-tag="step-version-details">
      <Box className="version-info">
        <div className="resolved-version">
          {hasVersionUpdate ? (
            <button
              type="button"
              aria-label="Update version"
              data-e2e-tag="step-version-details__update-button"
              className="icon icon-danger"
              onClick={() => onChange({ version: '' })}
            >
              <img alt="Update version" data-e2e-tag="step-version-details__update-icon" src={stepOutDatedIcon} />
            </button>
          ) : (
            <Text data-e2e-tag="step-version-details__branch-icon" className="icon">
              <Icon name="Branch" />
            </Text>
          )}

          <Text
            data-e2e-tag="step-version-details__version-text"
            className={classNames('version__text', {
              error: !step.isConfigured(),
            })}
          >
            {getStepVersionText()}
          </Text>
        </div>
        {step.isLibraryStep() && <Text className="latest-version">Step's latest version is: {latestVersion}</Text>}
      </Box>
      {step.isLibraryStep() && (
        <Box className="version-selector">
          <Text
            className={classNames('remark', { error: !step.isConfigured() })}
            dangerouslySetInnerHTML={html(getVersionRemark(step.requestedVersion() || ''))}
          />
          <select
            className="mak"
            id="selected-step-version-select"
            data-e2e-tag="step-version-details__version-selector"
            value={step.requestedVersion() || ''}
            onChange={(event) => onChange({ version: event.target.value })}
          >
            {versionsWithRemarks.map(({ version }) => (
              <option key={version} value={version}>
                {version || 'Always latest'}
              </option>
            ))}
          </select>
        </Box>
      )}
    </section>
  );
};

export default StepVersionDetails;
