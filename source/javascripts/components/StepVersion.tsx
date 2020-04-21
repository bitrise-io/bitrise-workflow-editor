import React, { FC } from "react";
import { Text } from "@bitrise/bitkit";
import classNames from "classnames";
import { Step } from "../models";
import semverService from "../services/semver-service";

import stepLatestIcon from "../../images/step/latest.svg";
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
		<section className="version">
			<div className="version-info">
				<div className="resolved-version">
					{isLatestVersion ? (
						<Text className={classNames("icon", "icon-ok")}>
							<img src={stepLatestIcon} />
						</Text>
					) : (
						<button
							className={classNames("icon", "icon-danger")}
							onClick={() => onUpdateStep(step, workflowIndex)}
						>
							<img src={stepOutDatedIcon} />
						</button>
					)}

					<Text className={classNames("version__text", { error: !step.isConfigured() })}>
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
