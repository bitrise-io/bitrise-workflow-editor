<<<<<<< Updated upstream
import { useState, useMemo } from "react";
=======
import React, { useState, useMemo } from "react";
>>>>>>> Stashed changes
import { Box, Icon, Text, Notification, Link } from "@bitrise/bitkit";
import CopyToClipboard from "react-copy-to-clipboard";
import { AppConfig } from "../../models/AppConfig";
import appConfigAsYml from "../../utils/appConfigAsYml";

type RepoYmlStorageActionsProps = {
	appConfig: AppConfig | string;
};

const RepoYmlStorageActions = ({ appConfig }: RepoYmlStorageActionsProps): JSX.Element => {
	const [actionSelected, setActionSelected] = useState<string | null>(null);
	const [clearActionTimeout, setClearActionTimeout] = useState<number | undefined>();

	const yml = useMemo(() => appConfigAsYml(appConfig), [appConfig]);

	const selectAction = (actionName: string): void => {
		setActionSelected(actionName);

		if (clearActionTimeout) {
			window.clearTimeout(clearActionTimeout);
		}

		setClearActionTimeout(window.setTimeout(() => setActionSelected(null), 5000));
	};

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Box display="flex" flexDirection="column" gap="24">
				<CopyToClipboard text={yml} onCopy={() => selectAction("clipboard")}>
<<<<<<< Updated upstream
					<Box display="flex" cursor="pointer" flexDirection="row" gap="8">
						<Icon textColor="purple.50" name="Link" />
						<Text textColor="purple.50">Copy the content of the current bitrise.yml file to the clipboard</Text>
=======
					<Box display="flex" gap="8" cursor="pointer">
						<Icon color="purple.50" name="Duplicate" />
						<Text color="purple.50">Copy the content of the current bitrise.yml file to the clipboard</Text>
>>>>>>> Stashed changes
					</Box>
				</CopyToClipboard>

				<Link
					href={`data:attachment/text,${encodeURIComponent(yml)}`}
					target="_blank"
					download="bitrise.yml"
					onClick={() => selectAction("download")}
				>
<<<<<<< Updated upstream
					<Box display="flex" flexDirection="row" gap="8">
						<Icon textColor="purple.50" name="Download" />
						<Text textColor="purple.50">Download the bitrise.yml file</Text>
=======
					<Box display="flex" gap="8">
						<Icon color="purple.50" name="Download" />
						<Text color="purple.50">Download the bitrise.yml file</Text>
>>>>>>> Stashed changes
					</Box>
				</Link>
			</Box>

			{actionSelected && (
<<<<<<< Updated upstream
				<Notification margin="8" status="success">
					<Text>
						{actionSelected === "clipboard"
							? "Copied the content of the current bitrise.yml file to the clipboard. "
							: "Downloading bitrise.yml. "}
						Commit the file to the app's repository before updating the setting.
					</Text>
=======
				<Notification marginY="8" status="success">
					{actionSelected === "clipboard"
						? "Copied the content of the current bitrise.yml file to the clipboard. "
						: "Downloading bitrise.yml. "}
					Commit the file to the app's repository before updating the setting.
>>>>>>> Stashed changes
				</Notification>
			)}
		</Box>
	);
};

export default RepoYmlStorageActions;
