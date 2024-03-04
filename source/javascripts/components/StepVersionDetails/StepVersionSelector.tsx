import { Box, Text } from "@bitrise/bitkit";
import classNames from "classnames";

import { Step } from "../../models";
import semverService from "../../services/semver-service";

export type StepVersionSelectorProps = {
	step: Step;
	versions: Array<string | null>;
	selectedVersion: string;
	onUpdateVersion: (version: string) => void;
	strings: {
		alwaysLatest: string;
		versionRemark: string;
	};
};

type DangerouslySetInnerHTMLProps = { __html: string };
const html = (text: string): DangerouslySetInnerHTMLProps => ({ __html: text });

const StepVersionSelector = ({
	step,
	versions,
	selectedVersion,
	onUpdateVersion,
	strings,
}: StepVersionSelectorProps): JSX.Element => (
	<Box className="version-selector">
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
			{versions.map((version) => {
				version = version || "";
				return (
					<option key={version} value={version} disabled={!semverService.checkVersionPartsLocked(version)}>
						{version || strings.alwaysLatest}
					</option>
				);
			})}
		</select>
	</Box>
);

export default StepVersionSelector;
