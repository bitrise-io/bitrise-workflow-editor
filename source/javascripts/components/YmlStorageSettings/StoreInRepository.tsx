import React, { FC, useMemo, useEffect, useState } from "react";
import { Flex, Text, Notification, Button, Buttons } from "@bitrise/bitkit";
import useUpdatePipelineConfigCallback from "../../hooks/api/useUpdatePipelineConfigCallback";
import useGetAppConfigFromRepoCallback from "../../hooks/api/useGetAppConfigFromRepoCallback";
import useGetAppConfigCallback from "../../hooks/api/useGetAppConfigCallback";
import ConfirmSwitchToRepositoryYml from "./ConfirmSwitchToRepositoryYml";
import RepoYmlStorageActions from "../common/RepoYmlStorageActions";
import StoreInRepositoryDescription from "./StoreInRepositoryDescription";
import InlineLink from "../common/InlineLink";

type StorageInRepositoryProps = {
	appSlug: string;
	onCancel(): void;
	onSuccess(): void;
};

const StorageInRepository: FC<StorageInRepositoryProps> = ({
	appSlug,
	onCancel,
	onSuccess
}: StorageInRepositoryProps) => {
	const {
		getAppConfigFromRepoStatus,
		getAppConfigFromRepoFailed,
		getAppConfigFromRepoLoading,
		getAppConfigFromRepo,
		appConfigFromRepo
	} = useGetAppConfigFromRepoCallback(appSlug);
	const {
		updatePipelineConfigStatus,
		updatePipelineConfigLoading,
		updatePipelineConfig
	} = useUpdatePipelineConfigCallback(appSlug, true);
	const { appConfig: currentWebsiteAppConfig, getAppConfig, getAppConfigLoading } = useGetAppConfigCallback(appSlug);
	const [confirmModalVisible, setconfirmModalVisible] = useState(false);
	const [initialCheckComplete, setInitialCheckComplete] = useState(false);

	useEffect(() => {
		getAppConfigFromRepo();
		getAppConfig();
	}, []);

	useEffect(() => {
		if (!getAppConfigLoading && !getAppConfigFromRepoLoading && getAppConfigFromRepoStatus && !initialCheckComplete) {
			setInitialCheckComplete(true);
		}
		if (initialCheckComplete && !getAppConfigFromRepoLoading && appConfigFromRepo) {
			updatePipelineConfig();
		}
	}, [getAppConfigLoading, getAppConfigFromRepoLoading, getAppConfigFromRepoStatus]);

	const isFinished = useMemo(() => {
		const isSuccessful = !updatePipelineConfigLoading && updatePipelineConfigStatus === 200;
		if (isSuccessful) {
			onSuccess();
		}

		return isSuccessful;
	}, [updatePipelineConfigStatus, updatePipelineConfigLoading]);

	const checkBitriseYmlInRepository = (): void => {
		setconfirmModalVisible(false);
		getAppConfigFromRepo();
	};

	if (!initialCheckComplete) {
		return <Notification type="progress">Looking for bitrise.yml in the app repository...</Notification>;
	}

	if (isFinished) {
		return (
			<Notification margin="x2" type="success">
				Successfully changed the bitrise.yml storage setting! The next build will use the bitrise.yml file in the app's
				repository.
			</Notification>
		);
	}

	return (
		<>
			<Flex direction="vertical" gap="x6">
				<StoreInRepositoryDescription
					title={
						appConfigFromRepo
							? "Update the bitrise.yml file in your app's repository"
							: "Add bitrise.yml to the app repository"
					}
					description={
						appConfigFromRepo
							? "The repository already contains a bitrise.yml file. Update the file in the repository with the content of the current one on bitrise.io. "
							: "You need to add your current bitrise.yml file to the app repository before proceeding. You can either copy the entire content of the file to the clipboard or download the file itself. "
					}
				/>

				<RepoYmlStorageActions appConfig={currentWebsiteAppConfig!} />

				{getAppConfigFromRepoFailed && (
					<Notification type="alert">
						<Text>
							{getAppConfigFromRepoFailed.message}
							<InlineLink color="red-4" text="Read more on syntax" url="REPLACE URL" />
						</Text>
					</Notification>
				)}

				{getAppConfigFromRepoLoading || updatePipelineConfigLoading ? (
					<Notification type="progress">Validating bitrise.yml in the app repository...</Notification>
				) : (
					<Buttons gap="x4">
						<Button level="primary" onClick={() => setconfirmModalVisible(true)}>
							Update settings
						</Button>
						<Button level="secondary" onClick={onCancel}>
							Cancel
						</Button>
					</Buttons>
				)}
			</Flex>

			<ConfirmSwitchToRepositoryYml
				visible={confirmModalVisible}
				onContinue={checkBitriseYmlInRepository}
				onCancel={() => setconfirmModalVisible(false)}
			/>
		</>
	);
};

export default StorageInRepository;
