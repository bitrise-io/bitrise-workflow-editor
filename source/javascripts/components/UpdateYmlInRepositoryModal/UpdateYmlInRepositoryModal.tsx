import { ReactElement, useEffect } from "react";
import { Button, Dialog, DialogBody, DialogFooter, ButtonGroup, Box, Text, Notification } from "@bitrise/bitkit";
import RepoYmlStorageActions from "../common/RepoYmlStorageActions";
import { AppConfig } from "../../models/AppConfig";
import useGetAppConfigFromRepoCallback from "../../hooks/api/useGetAppConfigFromRepoCallback";
import YmlNotFoundInRepositoryError from "../common/notifications/YmlNotFoundInRepositoryError";
import YmlInRepositoryInvalidError from "../common/notifications/YmlInRepositoryInvalidError";
import LookingForYmlInRepoProgress from "../common/notifications/LookingForYmlInRepoProgress";

type Props = {
	appSlug: string;
	onClose(): void;
	onComplete(): void;
	getDataToSave: () => AppConfig | string;
};

const UpdateYmlInRepositoryModal = ({ appSlug, getDataToSave, onClose, onComplete }: Props): JSX.Element => {
	const {
		getAppConfigFromRepoLoading,
		getAppConfigFromRepo,
		appConfigFromRepo,
		getAppConfigFromRepoStatus,
		getAppConfigFromRepoFailed
	} = useGetAppConfigFromRepoCallback(appSlug);
	const dataToSave = getDataToSave();

	useEffect(() => {
		if (appConfigFromRepo) {
			onComplete();
		}
	}, [appConfigFromRepo]);

	const renderError = (): ReactElement => {
		switch (getAppConfigFromRepoStatus) {
			case 404:
				return <YmlNotFoundInRepositoryError />;
			case 422:
				return <YmlInRepositoryInvalidError errorMessage={getAppConfigFromRepoFailed!.error_msg} />;
			default:
				return <Notification status="error">{getAppConfigFromRepoFailed!.error_msg}</Notification>;
		}
	};

	return (
		<Dialog
			backgroundColor="white"
			onClose={onClose}
			isOpen={true}
			width="640px"
			title="Update the bitrise.yml file in your app's repository"
		>
			<DialogBody>
				<Box display="flex" flexDirection="column" gap="16">
					<Text textColor="neutral.30">
						In order to apply your changes to your next build, you need to update the bitrise.yml file on your
						repository's main branch.
					</Text>
					<RepoYmlStorageActions appConfig={dataToSave} />
					<Text textColor="neutral.30">
						Once you are done, Bitrise will fetch the updated bitrise.yml file from your app's repository, and refresh
						the Workflow Editor. Any unsaved changes will be lost!
					</Text>

					{getAppConfigFromRepoLoading && <LookingForYmlInRepoProgress />}

					{appConfigFromRepo && (
						<Notification margin="8" status="success">
							Fetched bitrise.yml from app repository
						</Notification>
					)}

					{getAppConfigFromRepoFailed && renderError()}
				</Box>
			</DialogBody>
			<DialogFooter>
				{!getAppConfigFromRepoLoading && !appConfigFromRepo && (
					<ButtonGroup display="flex" justifyContent="end" spacing="0" gap="32">
						<Button variant="secondary" onClick={onClose}>
							Cancel
						</Button>
						<Button variant="primary" onClick={getAppConfigFromRepo}>
							I'm done
						</Button>
					</ButtonGroup>
				)}
			</DialogFooter>
		</Dialog>
	);
};

export default UpdateYmlInRepositoryModal;
