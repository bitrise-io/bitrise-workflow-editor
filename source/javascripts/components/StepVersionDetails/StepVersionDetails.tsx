import { Box, Icon, Text } from "@bitrise/bitkit";
import classNames from "classnames";
import { OnStepVersionChange, OnStepVersionUpgrade, Step, StepVersionWithRemark } from "../../models";
import { getVersionRemark } from "../../utils/stepVersionUtil";
import stepOutDatedIcon from "../../../images/step/upgrade.svg";

type StepVersionDetailsProps = {
	workflowIndex: number;
	step: Step;
	selectedVersion: string;
	latestVersion: string;
	isLatestVersion: boolean;
	versionsWithRemarks: Array<StepVersionWithRemark>;
	onVersionChange: OnStepVersionChange;
	onVersionUpgrade: OnStepVersionUpgrade;
};

type DangerouslySetInnerHTMLProps = { __html: string };
const html = (text: string): DangerouslySetInnerHTMLProps => ({ __html: text });

const StepVersionDetails = ({
	workflowIndex,
	step,
	selectedVersion,
	latestVersion,
	isLatestVersion,
	versionsWithRemarks = [],
	onVersionChange,
	onVersionUpgrade,
}: StepVersionDetailsProps) => {
	if (step.version === undefined) {
		return null;
	}

	return (
		<section className="version" data-e2e-tag="step-version-details">
			<Box className="version-info">
				<div className="resolved-version">
					{isLatestVersion ? (
						<Text data-e2e-tag="step-version-details__branch-icon" className="icon">
							<Icon name="Branch" />
						</Text>
					) : (
						<button
							data-e2e-tag="step-version-details__update-button"
							className="icon icon-danger"
							onClick={() => onVersionUpgrade(step, workflowIndex)}
						>
							<img data-e2e-tag="step-version-details__update-icon" src={stepOutDatedIcon} />
						</button>
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
						dangerouslySetInnerHTML={html(getVersionRemark(selectedVersion))}
					/>
					<select
						id="selected-step-version-select"
						data-e2e-tag="step-version-details__version-selector"
						value={selectedVersion}
						onChange={(event) => onVersionChange(event.target.value)}
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
