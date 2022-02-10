import React, { FC, useState, useMemo, useEffect } from "react";
import { Flex, Text, Notification, Button, Buttons, RadioButton } from "@bitrise/bitkit";
import useUpdatePipelineConfigCallback from "../../hooks/api/useUpdatePipelineConfigCallback";
import useGetAppConfigFromRepoCallback from "../../hooks/api/useGetAppConfigFromRepoCallback";
import usePostAppConfigCallback from "../../hooks/api/usePostAppConfigCallback";
import appConfigAsYml from "../../utils/appConfigAsYml";
import YmlNotFoundInRepositoryError from "../common/notifications/YmlNotFoundInRepositoryError";
import LookingForYmlInRepoProgress from "../common/notifications/LookingForYmlInRepoProgress";
import CreatingYmlOnWebsiteProgress from "../common/notifications/LookingForYmlInRepoProgress";
import { WFEWindow } from "../../typings/global";

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
	const { postAppConfig, postAppConfigStatus } = usePostAppConfigCallback(appSlug, appConfigAsYml(appConfigFromRepo));
	const {
		updatePipelineConfigStatus,
		updatePipelineConfigLoading,
		updatePipelineConfig
	} = useUpdatePipelineConfigCallback(appSlug, false);
	const [copyRepositoryYmlToWebsite, setCopyRepositoryYmlToWebsite] = useState(true);

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

	useEffect(() => {
		getAppConfigFromRepo();
	}, []);

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
				{(window as WFEWindow).strings["yml"]["store_on_website"]["success"]}
			</Notification>
		);
	}

	return (
		<Flex gap="x6" direction="vertical">
			<Flex direction="vertical" gap="x3">
				<Text size="5" weight="bold" textColor="gray-8">
					Store bitrise.yml on bitrise.io
				</Text>
				<Text>Choose which bitrise.yml file should be used on bitrise.io from now:</Text>
				<RadioButton
					disabled={updatePipelineConfigLoading || getAppConfigFromRepoLoading}
					name="website-copy-option"
					defaultChecked={copyRepositoryYmlToWebsite}
					onClick={() => setCopyRepositoryYmlToWebsite(true)}
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
