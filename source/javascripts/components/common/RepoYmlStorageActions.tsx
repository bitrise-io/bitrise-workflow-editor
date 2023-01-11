import { useState, useEffect, useRef } from "react";
import { Box, Icon, Text, Notification, Link } from "@bitrise/bitkit";
import CopyToClipboard from "react-copy-to-clipboard";
import { AppConfig } from "../../models/AppConfig";
import appConfigAsYml from "../../utils/appConfigAsYml";
import useMonolithApiCallback from "../../hooks/api/useMonolithApiCallback";

type RepoYmlStorageActionsProps = {
	appConfig: AppConfig | string;
};

const useFormattedYml = (appConfig: AppConfig): { yml: string; failed: boolean; loading: boolean } => {
	const [yml, setYml] = useState(typeof appConfig === "string" ? appConfig : "");
	const formatAppConfigRef = useRef<() => void>();
	const { loading, failed, result, call } = useMonolithApiCallback<string>(
		"/api/cli/format",
		{
			method: "POST",
			body: JSON.stringify(appConfig)
		},
		(value: string) => value
	);

	// NOTE: call function isn't referentially stable
	useEffect(() => {
		formatAppConfigRef.current = call;
	});

	useEffect(() => {
		// NOTE: If we get a string we don't need to check with the format service
		if (typeof appConfig === "object") {
			formatAppConfigRef.current?.();
		}
	}, [appConfig]);

	useEffect(() => {
		if (failed && appConfig) {
			setYml(appConfigAsYml(appConfig));
			return;
		}

		if (result && !failed) {
			setYml(result);
		}
	}, [result, failed, appConfig]);

	return {
		yml,
		failed: !!failed,
		loading
	};
};

const RepoYmlStorageActions = ({ appConfig }: RepoYmlStorageActionsProps): JSX.Element => {
	const [actionSelected, setActionSelected] = useState<string | null>(null);
	const [clearActionTimeout, setClearActionTimeout] = useState<number | undefined>();

	const { yml } = useFormattedYml(appConfig);

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
					<Box display="flex" gap="8" cursor="pointer">
						<Icon color="purple.50" name="Duplicate" />
						<Text color="purple.50">Copy the content of the current bitrise.yml file to the clipboard</Text>
					</Box>
				</CopyToClipboard>

				<Link
					href={`data:attachment/text,${encodeURIComponent(yml)}`}
					target="_blank"
					download="bitrise.yml"
					onClick={() => selectAction("download")}
				>
					<Box display="flex" gap="8">
						<Icon color="purple.50" name="Download" />
						<Text color="purple.50">Download the bitrise.yml file</Text>
					</Box>
				</Link>
			</Box>

			{actionSelected && (
				<Notification marginY="8" status="success">
					{actionSelected === "clipboard"
						? "Copied the content of the current bitrise.yml file to the clipboard. "
						: "Downloading bitrise.yml. "}
					Commit the file to the app's repository before updating the setting.
				</Notification>
			)}
		</Box>
	);
};

export default RepoYmlStorageActions;
