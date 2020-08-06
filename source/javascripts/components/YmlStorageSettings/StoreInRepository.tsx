import React, { FC, useMemo, useEffect, useState } from "react";
import { Flex, Text, Notification, Button, Buttons, Link } from "@bitrise/bitkit";
import useUpdatePipelineConfigCallback from "../../hooks/api/useUpdatePipelineConfigCallback";
import useGetAppConfigFromRepoCallback from "../../hooks/api/useGetAppConfigFromRepoCallback";
import useGetAppConfigCallback from "../../hooks/api/useGetAppConfigCallback";
import RepoYmlStorageActions from "./RepoYmlStorageActions";
import ConfirmSwitchToRepositoryYml from "./ConfirmSwitchToRepositoryYml";

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
	const { appConfig, getAppConfig, getAppConfigLoading } = useGetAppConfigCallback(appSlug);
	const [confirmModalVisible, setconfirmModalVisible] = useState(false);
	const [initialCheckComplete, setInitialCheckComplete] = useState(false);

	useEffect(() => {
		getAppConfigFromRepo();
		getAppConfig();
	}, []);

	useEffect(() => {
		if (!getAppConfigFromRepoLoading && getAppConfigFromRepoStatus && !initialCheckComplete) {
			setInitialCheckComplete(true);
		}
		if (initialCheckComplete && !getAppConfigFromRepoLoading && appConfigFromRepo) {
			updatePipelineConfig();
		}
	}, [getAppConfigFromRepoLoading, getAppConfigFromRepoStatus]);

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

	return (
		<Flex gap="x6" direction="vertical">
			{!initialCheckComplete && (
				<Notification margin="x2" type="progress">
					Looking for bitrise.yml in the app repository...
				</Notification>
			)}

			{!isFinished && initialCheckComplete && (
				<Flex direction="vertical" gap="x8">
					<Flex direction="vertical" gap="x4">
						<Text config="5" textColor="gray-8">
							{appConfigFromRepo ? "Update bitrise.yml in app repository" : "Add bitrise.yml to the app repository"}
						</Text>
						<Text>
							{appConfigFromRepo
								? `The repository already contains a bitrise.yml. Update the bitrise.yml
								in the repository with the current one on bitrise.io.`
								: `Before switching to bitrise.yml in the app repo, you need to add bitrise.yml
								to the app repository with the current config.`}
							<Text inline textColor="grape-3" paddingHorizontal="x1">
								<Link target="_blank" href="https://bitkit.netlify.app/documentation/components/Link">
									Read more
								</Link>
							</Text>
						</Text>
					</Flex>

					{!getAppConfigLoading && appConfig ? (
						<RepoYmlStorageActions appConfig={appConfig} />
					) : (
						<Notification margin="x2" type="progress">
							Loading current bitrise.yml...
						</Notification>
					)}

					{!getAppConfigLoading && getAppConfigFromRepoFailed && (
						<Notification margin="x2" type="alert">
							<Text>
								{getAppConfigFromRepoFailed.message}
								<Text inline textColor="red-4" paddingHorizontal="x1">
									<Link underline target="_blank" href="https://bitkit.netlify.app/documentation/components/Link">
										Read more on syntax
									</Link>
								</Text>
							</Text>
						</Notification>
					)}

					{getAppConfigFromRepoLoading || updatePipelineConfigLoading ? (
						<Notification margin="x2" type="progress">
							Validating bitrise.yml in the app repository...
						</Notification>
					) : (
						<Buttons>
							<Button level="primary" onClick={() => setconfirmModalVisible(true)}>
								Update settings
							</Button>
							<Button level="secondary" onClick={onCancel}>
								Cancel
							</Button>
						</Buttons>
					)}
				</Flex>
			)}

			<ConfirmSwitchToRepositoryYml
				visible={confirmModalVisible}
				onContinue={checkBitriseYmlInRepository}
				onCancel={() => setconfirmModalVisible(false)}
			/>

			{isFinished && (
				<Notification margin="x2" type="success">
					Changed bitrise.yml setting. The next build will bitrise.io in the app repository.
				</Notification>
			)}
		</Flex>
	);
};

export default StorageInRepository;
