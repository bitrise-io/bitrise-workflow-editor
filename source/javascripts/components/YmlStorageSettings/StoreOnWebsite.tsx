import React, { FC, useState, useMemo, useEffect } from "react";
import { Flex, Text, Notification, Button, Buttons, RadioButton } from "@bitrise/bitkit";
import useUpdatePipelineConfigCallback from "../../hooks/api/useUpdatePipelineConfigCallback";
import useGetAppConfigFromRepoCallback from "../../hooks/api/useGetAppConfigFromRepoCallback";
import usepostAppConfigCallback from "../../hooks/api/usePostAppConfigCallback";
import * as YAML from "json-to-pretty-yaml";

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

	return (
		<Flex gap="x6" direction="vertical">
			{!isFinished && (
				<Flex direction="vertical" gap="x3">
					<Text config="5" textColor="gray-8">
						Store bitrise.yml on bitrise.io
					</Text>
					<Text>Choose which yml should be copied to bitrise.io:</Text>
					<RadioButton
						disabled={updatePipelineConfigLoading || getAppConfigFromRepoLoading}
						name="website-copy-option"
						defaultChecked={copyRepositoryYmlToWebsite}
						onClick={handleCopyToRepositorySelection}
					>
						Copy the content of the bitrise.yml from the app repository
					</RadioButton>
					<RadioButton
						disabled={updatePipelineConfigLoading || getAppConfigFromRepoLoading}
						name="website-copy-option"
						defaultChecked={!copyRepositoryYmlToWebsite}
						onClick={() => setCopyRepositoryYmlToWebsite(false)}
					>
						Copy the last version you used on web
					</RadioButton>
				</Flex>
			)}

			{getAppConfigFromRepoLoading && (
				<Notification margin="x2" type="progress">
					Looking for bitrise.yml in the app repository...
				</Notification>
			)}

			{appConfigFromRepo && getAppConfigFromRepoFailed && (
				<Notification margin="x2" type="alert">
					Couldn’t find the bitrise.yml. Add the file to the master branch and try again.
				</Notification>
			)}

			{updatePipelineConfigLoading && (
				<Notification margin="x2" type="progress">
					Creating bitrise.yml on bitrise.io...
				</Notification>
			)}

			{isFinished && (
				<Notification margin="x2" type="success">
					Changed bitrise.yml setting. The next build will bitrise.yml stored on bitrise.io.
				</Notification>
			)}

			{!getAppConfigFromRepoLoading && !updatePipelineConfigLoading && !isFinished && (
				<Buttons>
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
