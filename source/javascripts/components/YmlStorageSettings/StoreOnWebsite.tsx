import React, { FC, useState, useMemo, useEffect } from "react";
import { Flex, Text, Notification, Button, Buttons, RadioButton } from "@bitrise/bitkit";
import useUpdatePipelineConfigCallback from "../../hooks/api/useUpdatePipelineConfigCallback";
import useGetAppConfigFromRepoCallback from "../../hooks/api/useGetAppConfigFromRepoCallback";
import usepostAppConfigCallback from "../../hooks/api/usePostAppConfigCallback";
import * as YAML from "json-to-pretty-yaml";
import {
	YmlNotFoundInRepositoryError,
	LookingForYmlInRepoProgress,
	CreatingYmlOnWebsiteProgress
} from "./YmlStorageSettingsNotifications";

type StoreOnWebsiteProps = {
	appSlug: string;
	onCancel(): void;
	onSuccess(): void;
};

const StoreOnWebsite: FC<StoreOnWebsiteProps> = ({ appSlug, onCancel, onSuccess }: StoreOnWebsiteProps) => {
	const {
		getAppConfigFromRepoStatus,
		getAppConfigFromRepoFailed,
		getAppConfigFromRepoLoading,
		getAppConfigFromRepo,
		appConfigFromRepo
	} = useGetAppConfigFromRepoCallback(appSlug);
	const { postAppConfig, postAppConfigStatus } = usepostAppConfigCallback(appSlug, YAML.stringify(appConfigFromRepo));
	const {
		updatePipelineConfigStatus,
		updatePipelineConfigLoading,
		updatePipelineConfig
	} = useUpdatePipelineConfigCallback(appSlug, false);
	const [copyRepositoryYmlToWebsite, setCopyRepositoryYmlToWebsite] = useState(false);

	const isFinished = useMemo(() => {
		const isSuccessful = !updatePipelineConfigLoading && updatePipelineConfigStatus === 200;
		const isUploadFinished = !copyRepositoryYmlToWebsite || postAppConfigStatus === 200;
		if (isSuccessful && isUploadFinished) {
			onSuccess();
		}

		return isSuccessful && isUploadFinished;
	}, [updatePipelineConfigStatus, updatePipelineConfigLoading, postAppConfigStatus]);

	useEffect(() => {
		if (appConfigFromRepo && !appConfigFromRepo) {
			setCopyRepositoryYmlToWebsite(false);
		}
	}, [appConfigFromRepo, getAppConfigFromRepoStatus]);

	useEffect(() => {
		if (!updatePipelineConfigLoading && updatePipelineConfigStatus === 200 && copyRepositoryYmlToWebsite) {
			postAppConfig();
		}
	}, [updatePipelineConfigLoading, updatePipelineConfigStatus, copyRepositoryYmlToWebsite]);

	const handleCopyToRepositorySelection = (): void => {
		setCopyRepositoryYmlToWebsite(true);

		if (getAppConfigFromRepoStatus !== 200) {
			getAppConfigFromRepo();
		}
	};

	const renderError = (): React.ReactElement => {
		switch (getAppConfigFromRepoStatus) {
			case 404:
				return <YmlNotFoundInRepositoryError />;
			default:
				return <Notification type="alert">{getAppConfigFromRepoFailed!.error_msg}</Notification>;
		}
	};

	if (isFinished) {
		return (
			<Notification margin="x2" type="success">
				Successfully changed the bitrise.yml storage setting! The next build will use the bitrise.yml file stored on
				bitrise.io.
			</Notification>
		);
	}

	return (
		<Flex gap="x6" direction="vertical">
			<Flex direction="vertical" gap="x3">
				<Text config="5" textColor="gray-8">
					Store bitrise.yml on bitrise.io
				</Text>
				<Text>Choose which bitrise.yml file should be used on bitrise.io from now:</Text>
				<RadioButton
					disabled={updatePipelineConfigLoading || getAppConfigFromRepoLoading}
					name="website-copy-option"
					defaultChecked={copyRepositoryYmlToWebsite}
					onClick={handleCopyToRepositorySelection}
				>
					Copy the content of the bitrise.yml file stored in the app's repository
				</RadioButton>
				<RadioButton
					disabled={updatePipelineConfigLoading || getAppConfigFromRepoLoading}
					name="website-copy-option"
					defaultChecked={!copyRepositoryYmlToWebsite}
					onClick={() => setCopyRepositoryYmlToWebsite(false)}
				>
					Copy the last version you used on bitrise.io
				</RadioButton>
			</Flex>

			{getAppConfigFromRepoLoading && <LookingForYmlInRepoProgress />}
			{getAppConfigFromRepoFailed && renderError()}

			{updatePipelineConfigLoading && <CreatingYmlOnWebsiteProgress />}
			{!getAppConfigFromRepoLoading && !updatePipelineConfigLoading && !isFinished && (
				<Buttons gap="x4">
					<Button level="primary" onClick={updatePipelineConfig}>
						Update settings
					</Button>
					<Button level="secondary" onClick={onCancel}>
						Cancel
					</Button>
				</Buttons>
			)}
		</Flex>
	);
};

export default StoreOnWebsite;
