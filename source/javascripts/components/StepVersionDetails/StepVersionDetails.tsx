import React, { Fragment } from "react";
import { Text, Base } from "@bitrise/bitkit";
import { Step } from "../../models";

import StepResolvedVersionInfo from "./StepResolvedVersionInfo";
import StepVersionSelector, { StepVersionSelectorProps } from "./StepVersionSelector";

type StringProps = {
	versionText: string;
	latestVersionText: string;
	invalidVersionText: string;
};

type StepVersionDetailsProps = {
	step: Step;
	isLatestVersion: boolean;
	workflowIndex: number;
	onUpdateStep: (step: Step, index: number) => void;
	versionSelectorOpts: StepVersionSelectorProps;
	selectedVersion: string;
	versions: Array<string | null>;
	strings: StringProps;
};

const StepVersionDetails = ({
	step,
	isLatestVersion,
	onUpdateStep,
	workflowIndex,
	versions,
	selectedVersion = "",
	versionSelectorOpts,
	strings
}: StepVersionDetailsProps): JSX.Element => {
	const isVersionDefined = step.version !== undefined;

	return (
		<Fragment>
			{isVersionDefined && (
				<section className="version" data-e2e-tag="step-version-details">
					<Base className="version-info">
						<StepResolvedVersionInfo
							step={step}
							isLatestVersion={isLatestVersion}
							onUpdateStep={onUpdateStep}
							workflowIndex={workflowIndex}
							strings={strings}
						/>
						{step.isLibraryStep() && <Text className="latest-version">{strings.latestVersionText}</Text>}
					</Base>
					{step.isLibraryStep() && (
						<StepVersionSelector
							{...versionSelectorOpts}
							step={step}
							versions={versions}
							selectedVersion={selectedVersion}
						/>
					)}
				</section>
			)}
		</Fragment>
	);
};

export default StepVersionDetails;
