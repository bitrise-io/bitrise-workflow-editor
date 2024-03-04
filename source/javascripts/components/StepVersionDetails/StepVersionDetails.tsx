import { Box, Icon, Text } from "@bitrise/bitkit";
import classNames from "classnames";
import { OnStepPropertyChange, Step, StepVersionWithRemark } from "../../models";
import { getVersionRemark } from "../../utils/stepVersionUtil";
import stepOutDatedIcon from "../../../images/step/upgrade.svg";

type StepVersionDetailsProps = {
	workflowIndex: number;
	step: Step;
	latestVersion: string;
	hasVersionUpdate: boolean;
	versionsWithRemarks: Array<StepVersionWithRemark>;
	onPropertyChange: OnStepPropertyChange;
};

type DangerouslySetInnerHTMLProps = { __html: string };
const html = (text: string): DangerouslySetInnerHTMLProps => ({ __html: text });

const StepVersionDetails = ({
	step,
	latestVersion,
	hasVersionUpdate,
	versionsWithRemarks = [],
	onPropertyChange,
}: StepVersionDetailsProps) => {
	console.log(
		"StepVersionDetailsProps",
		step,
		"latest?",
		hasVersionUpdate,
		"latest version",
		latestVersion,
		"selected version",
		step.requestedVersion() || "latest",
	);
	if (step.version === undefined) {
		return null;
	}

	return (
		<section className="version" data-e2e-tag="step-version-details">
			<Box className="version-info">
				<div className="resolved-version">
					{hasVersionUpdate ? (
						<button
							data-e2e-tag="step-version-details__update-button"
							className="icon icon-danger"
							onClick={() => onPropertyChange({ version: "" })}
						>
							<img data-e2e-tag="step-version-details__update-icon" src={stepOutDatedIcon} />
						</button>
					) : (
						<Text data-e2e-tag="step-version-details__branch-icon" className="icon">
							<Icon name="Branch" />
						</Text>
					)}

					<Text
						data-e2e-tag="step-version-details__version-text"
						className={classNames("version__text", { error: !step.isConfigured() })}
					>
						{step.isConfigured() ? `Version: ${step.requestedVersion() || latestVersion}` : "Invalid version"}
					</Text>
				</div>
				{step.isLibraryStep() && <Text className="latest-version">Step's latest version is: {latestVersion}</Text>}
			</Box>
			{step.isLibraryStep() && (
				<Box className="version-selector">
					<Text
						className={classNames("remark", { error: !step.isConfigured() })}
						dangerouslySetInnerHTML={html(getVersionRemark(step.requestedVersion() || ""))}
					/>
					<select
						id="selected-step-version-select"
						data-e2e-tag="step-version-details__version-selector"
						value={step.requestedVersion() || ""}
						onChange={(event) => onPropertyChange({ version: event.target.value })}
					>
						{versionsWithRemarks.map(({ version }) => (
							<option key={version} value={version}>
								{version || "Always latest"}
							</option>
						))}
					</select>
				</Box>
			)}
		</section>
	);
};

export default StepVersionDetails;
