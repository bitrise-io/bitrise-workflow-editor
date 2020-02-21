import React, { FunctionComponent } from "react";
import { Text } from "@bitrise/bitkit";
import classNames from "classnames";
import { Step } from "../../models";

// @ts-ignore
import stepLatestIcon from "../../../images/step/latest.svg";
// @ts-ignore
import stepOutDatedIcon from "../../../images/step/upgrade.svg";

type StepVersionInfoProps = {
    step :Step
    isLatestVersion :boolean
    workflowIndex :number
    onUpdateStep: (step :Step, index :number) => void
    strings :Map<string, string>
};

const StepVersionInfo: FunctionComponent<StepVersionInfoProps> = ({
    step,
    isLatestVersion,
    onUpdateStep,
    workflowIndex,
    strings
}: StepVersionInfoProps) => (
    <div className="version-info">
        <div className="resolved-version">
            {isLatestVersion ? (
                <Text className={classNames("icon", "icon-ok")}>
                    <img src={stepLatestIcon} />
                </Text>
            ) : (
                <button className={classNames("icon", "icon-danger")} onClick={() => onUpdateStep(step, workflowIndex)}>
                    <img src={stepOutDatedIcon} />
                </button>
            )}

            <Text className={classNames("version__text", { "error": !step.isConfigured() })}>
                {step.isConfigured() ? strings["version-text"] : strings["invalid-version-text"]}
            </Text>
        </div>

        <Text className="latest-version">{strings["latest-version-text"]}</Text>
    </div>
);

export default StepVersionInfo;
