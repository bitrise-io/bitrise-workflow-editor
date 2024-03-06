import { Box, Button, ButtonGroup, Notification, Radio, Text } from "@bitrise/bitkit";
import { useEffect, useMemo, useState } from "react";

import useGetAppConfigFromRepoCallback from "../../hooks/api/useGetAppConfigFromRepoCallback";
import usePostAppConfigCallback from "../../hooks/api/usePostAppConfigCallback";
import useUpdatePipelineConfigCallback from "../../hooks/api/useUpdatePipelineConfigCallback";
import { WFEWindow } from "../../typings/global";
import appConfigAsYml from "../../utils/appConfigAsYml";
import LookingForYmlInRepoProgress from "../common/notifications/LookingForYmlInRepoProgress";
import CreatingYmlOnWebsiteProgress from "../common/notifications/LookingForYmlInRepoProgress";
import YmlNotFoundInRepositoryError from "../common/notifications/YmlNotFoundInRepositoryError";

type StoreOnWebsiteProps = {
	appSlug: string;
	onCancel(): void;
	onSuccess(): void;
};

const StoreOnWebsite = ({ appSlug, onCancel, onSuccess }: StoreOnWebsiteProps): JSX.Element => {
	const {
		getAppConfigFromRepoStatus,
		getAppConfigFromRepoFailed,
		getAppConfigFromRepoLoading,
		getAppConfigFromRepo,
		appConfigFromRepo,
	} = useGetAppConfigFromRepoCallback(appSlug);
	const { postAppConfig, postAppConfigStatus } = usePostAppConfigCallback(appSlug, appConfigAsYml(appConfigFromRepo));
	const { updatePipelineConfigStatus, updatePipelineConfigLoading, updatePipelineConfig } =
		useUpdatePipelineConfigCallback(appSlug, false);
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
				return <Notification status="error">{getAppConfigFromRepoFailed!.error_msg}</Notification>;
		}
	};

	if (isFinished) {
		return (
			<Notification margin="x2" status="success">
				{(window as WFEWindow).strings["yml"]["store_on_website"]["success"]}
			</Notification>
		);
	}

	return (
		<Box gap="24" display="flex" flexDirection="column">
			<Box display="flex" flexDirection="column" gap="12">
				<Text size="5" fontWeight="bold" textColor="neutral.30">
					Store bitrise.yml on bitrise.io
				</Text>
				<Text>Choose which bitrise.yml file should be used on bitrise.io from now:</Text>
				<Radio
					disabled={updatePipelineConfigLoading || getAppConfigFromRepoLoading}
					name="website-copy-option"
					isChecked={copyRepositoryYmlToWebsite}
					onChange={() => setCopyRepositoryYmlToWebsite(true)}
				>
					Copy the content of the bitrise.yml file stored in the app's repository
				</Radio>
				<Radio
					disabled={updatePipelineConfigLoading || getAppConfigFromRepoLoading}
					name="website-copy-option"
					isChecked={!copyRepositoryYmlToWebsite}
					onChange={() => setCopyRepositoryYmlToWebsite(false)}
				>
					Copy the last version you used on bitrise.io
				</Radio>
			</Box>

			{getAppConfigFromRepoLoading && <LookingForYmlInRepoProgress />}
			{getAppConfigFromRepoFailed && renderError()}

			{updatePipelineConfigLoading && <CreatingYmlOnWebsiteProgress />}
			{!getAppConfigFromRepoLoading && !updatePipelineConfigLoading && !isFinished && (
				<ButtonGroup spacing="16">
					<Button variant="primary" onClick={updatePipelineConfig}>
						Update settings
					</Button>
					<Button variant="secondary" onClick={onCancel}>
						Cancel
					</Button>
				</ButtonGroup>
			)}
		</Box>
	);
};

export default StoreOnWebsite;
