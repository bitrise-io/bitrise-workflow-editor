import React, { FC } from "react";
import { Text, Icon } from "@bitrise/bitkit";
import classNames from "classnames";
import { Step } from "../models";
import semverService from "../services/semver-service";

import stepOutDatedIcon from "../../images/step/upgrade.svg";

type VersionSelectorProps = {
	step: Step;
	versions: Array<string | null>;
	selectedVersion: string;
	onUpdateVersion: (version: string) => void;
	strings: {
		alwaysLatest: string;
		versionRemark: string;
	};
};

type StepVersionInfoProps = {
	step: Step;
	isLatestVersion: boolean;
	workflowIndex: number;
	onUpdateStep: (step: Step, index: number) => void;
	versionSelectorOpts: VersionSelectorProps;
	selectedVersion: string;
	versions: Array<string | null>;
	strings: {
		versionText: string;
		latestVersionText: string;
		invalidVersionText: string;
	};
};

const html = (text: string) => ({ __html: text });

const VersionSelector: FC<VersionSelectorProps> = ({
	step,
	versions,
	selectedVersion,
	onUpdateVersion,
	strings
}: VersionSelectorProps) => {
	if (!step.isLibraryStep()) {
		return null;
	}

	return (
		<div className="version-selector">
			<Text
				className={classNames("remark", { error: !step.isConfigured() })}
				dangerouslySetInnerHTML={html(strings.versionRemark)}
			/>
			<select
				id="selected-step-version-select"
				data-e2e-tag="step-version-details__version-selector"
				value={selectedVersion}
				onChange={({ target }) => {
					onUpdateVersion(target.value);
				}}
			>
				{versions.map(version => {
					version = version || "";
					return (
						<option key={version} value={version} disabled={!semverService.checkVersionPartsLocked(version)}>
							{version || strings.alwaysLatest}
						</option>
					);
				})}
			</select>
		</div>
	);
};

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
		<section className="version" data-e2e-tag="step-version-details">
			<div className="version-info">
				<div className="resolved-version">
					{isLatestVersion ? (
						<Text 
							data-e2e-tag="step-version-details__branch-icon"
							className={classNames("icon", "icon-ok")}>
							<Icon name="BranchBranch" />
						</Text>
					) : (
						<button
							data-e2e-tag="step-version-details__update-button"
							className={classNames("icon", "icon-danger")}
							onClick={() => onUpdateStep(step, workflowIndex)}
						>
							<img data-e2e-tag="step-version-details__update-icon" src={stepOutDatedIcon} />
						</button>
					)}

					<Text 
						data-e2e-tag="step-version-details__version-text"
						className={classNames("version__text", { error: !step.isConfigured() })}>
						{step.isConfigured() ? strings.versionText : strings.invalidVersionText}
					</Text>
				</div>

				{step.isLibraryStep() && <Text className="latest-version">{strings.latestVersionText}</Text>}
			</div>
			<VersionSelector
				{...versionSelectorOpts}
				step={step}
				versions={versions}
				selectedVersion={selectedVersion}
			/>
		</section>
	);
};

export default StepVersion;
