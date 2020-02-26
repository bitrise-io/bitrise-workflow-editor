import React, { FC } from "react";
import { Text } from "@bitrise/bitkit";
import classNames from "classnames";
import { Step } from "../models";
import semverService from "../services/semver-service";

// @ts-ignore
import stepLatestIcon from "../../images/step/latest.svg";
// @ts-ignore
import stepOutDatedIcon from "../../images/step/upgrade.svg";


type VersionSelectorProps = {
    versions: Array<string|null>
    selectedVersion: string,
    onUpdateVersion: (version: string) => void,
    strings :{
        alwaysLatest: string
    }
};

type StepVersionInfoProps = {
    step :Step
    isLatestVersion :boolean
    workflowIndex :number
    onUpdateStep: (step :Step, index :number) => void,
    versionSelectorOpts: VersionSelectorProps,
    selectedVersion: string,
    versions: Array<string|null>,
    strings :{
        versionText :string,
        latestVersionText :string,
        invalidVersionText: string,
        versionRemark: string,
    }
};

const html = (text: string) => ({ __html: text });

const VersionSelector: FC<VersionSelectorProps> = ({ versions, selectedVersion, onUpdateVersion, strings }: VersionSelectorProps) => (
    <select id="selected-step-version-select" value={selectedVersion} onChange={({ target }) => { onUpdateVersion(target.value); }}>
        {versions.map(version => {
            version = version || "";
            return (
                <option key={version} value={version} disabled={!semverService.checkVersionPartsLocked(version)}>
                    {version || strings.alwaysLatest}
                </option>
            );
        })}
    </select>
);

const StepVersion: FC<StepVersionInfoProps> = ({
    step,
    isLatestVersion,
    onUpdateStep,
    workflowIndex,
    versions,
    selectedVersion,
    versionSelectorOpts,
    strings
}: StepVersionInfoProps) => {
    if (step.version === undefined) {
        return null;
    }

    selectedVersion = selectedVersion || "";

    return (
        <section className="version">
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
                        {step.isConfigured() ? strings.versionText : strings.invalidVersionText}
                    </Text>
                </div>

                {step.isLibraryStep() && <Text className="latest-version">{strings.latestVersionText}</Text>}
            </div>
            <div className="version-selector">
                <Text className={classNames("remark", { error: !step.isConfigured() })} dangerouslySetInnerHTML={html(strings.versionRemark)} />
                <VersionSelector {...versionSelectorOpts} versions={versions} selectedVersion={selectedVersion} />
            </div>
        </section>
    );
};

export default StepVersion;
