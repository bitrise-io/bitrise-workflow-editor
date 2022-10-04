import { Text, Icon } from "@bitrise/bitkit";
import classNames from "classnames";
import { Step } from "../../models";

import stepOutDatedIcon from "../../../images/step/upgrade.svg";

type StepResolvedVersionInfoProps = {
	step: Step;
	isLatestVersion: boolean;
	workflowIndex: number;
	onUpdateStep: (step: Step, index: number) => void;
	strings: {
		versionText: string;
		latestVersionText: string;
		invalidVersionText: string;
	};
};

const StepResolvedVersionInfo = ({
	step,
	isLatestVersion,
	workflowIndex,
	onUpdateStep,
	strings
}: StepResolvedVersionInfoProps): JSX.Element => {
	const isUpdateAvailable = !isLatestVersion;

	return (
		<div className="resolved-version">
			{isLatestVersion && (
				<Text data-e2e-tag="step-version-details__branch-icon" className="icon">
					<Icon name="Branch" />
				</Text>
			)}
			{isUpdateAvailable && (
				<button
					data-e2e-tag="step-version-details__update-button"
					className="icon ion-danger"
					onClick={() => onUpdateStep(step, workflowIndex)}
				>
					<img data-e2e-tag="step-version-details__update-icon" src={stepOutDatedIcon} />
				</button>
			)}

			<Text
				data-e2e-tag="step-version-details__version-text"
				className={classNames("version__text", { error: !step.isConfigured() })}
			>
				{step.isConfigured() ? strings.versionText : strings.invalidVersionText}
			</Text>
		</div>
	);
};

export default StepResolvedVersionInfo;
