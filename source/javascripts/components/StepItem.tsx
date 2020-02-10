import React, { FunctionComponent } from "react";
import { Text } from "@bitrise/bitkit";
import { Step } from "../models";

// @ts-ignore
import defaultStepIcon from "../../images/step/icon-default.svg";
// @ts-ignore
import verifiedIcon from "../../images/step/badge-verified.svg";
// @ts-ignore
import deprecatedIcon from "../../images/step/badge-deprecated.svg";

type StringProps = {
    alwaysLatest: string
}

type StepItemProps = {
  step: Step,
  strings: StringProps,
  tabindex: number,
  stepIndex: number,
  onSelected: (step: Step, index: number) => void
}

export const normalizeIconUrl = (step: Step): string => {
  var defaultStepIconURL = defaultStepIcon;
  var stepIconURL = step.iconURL();

  return stepIconURL || defaultStepIconURL;
};

const StepItem: FunctionComponent<StepItemProps> = ({ step, strings, tabindex, stepIndex, onSelected } : StepItemProps) => (
  <button className="step" tabIndex={tabindex} onClick={() => onSelected(step, stepIndex)}>
    <img className="icon" src={normalizeIconUrl(step)} />
    <span className="info">
      <strong>
        <Text className="title">{step.displayName()}</Text>
        {step.isVerified() && <img className="verified" src={verifiedIcon} />}
        {step.isDeprecated() && <img className="deprecated" src={deprecatedIcon} />}
      </strong>
      <em className="version">
        {step.requestedVersion()
            ? <Text>{step.version}</Text>
            : <Text>{strings.alwaysLatest + (step.version && ` (${step.version})`)}</Text>}
      </em>
    </span>
  </button>
);

export default StepItem;
