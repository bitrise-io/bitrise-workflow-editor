import React, { FC, useEffect } from "react";
import { Modal, ModalBody, Flex, ModalTitle, Buttons, Button, Text, Notification } from "@bitrise/bitkit";
import RepoYmlStorageActions from "../common/RepoYmlStorageActions";
import { AppConfig } from "../../models/AppConfig";
import useGetAppConfigFromRepoCallback from "../../hooks/api/useGetAppConfigFromRepoCallback";

type Props = {
	appSlug: string;
	onClose(): void;
	onComplete(): void;
	getDataToSave: () => AppConfig | string;
};

const UpdateYmlInRepositoryModal: FC<Props> = ({ appSlug, getDataToSave, onClose, onComplete }: Props) => {
	const { getAppConfigFromRepoLoading, getAppConfigFromRepo, appConfigFromRepo } = useGetAppConfigFromRepoCallback(
		appSlug
	);
	const dataToSave = getDataToSave();

	useEffect(() => {
		if (appConfigFromRepo) {
			onComplete();
		}
	}, [appConfigFromRepo]);

	return (
		<Modal backgroundColor="white" onClose={onClose} visible={true} width="640px">
			<ModalBody>
				<Flex direction="vertical" gap="x4">
					<ModalTitle>Update the bitrise.yml file in your app's repository</ModalTitle>
					<Text textColor="gray-8">
						In order to apply your changes to your next build, you need to update the bitrise.yml file on your
						repository's main branch.
					</Text>
					<RepoYmlStorageActions appConfig={dataToSave} />
					<Text textColor="gray-8">
						Once you are done, Bitrise will fetch the updated bitrise.yml file from your app's repository, and refresh
						the Workflow Editor. Any unsaved changes will be lost!
					</Text>

					{getAppConfigFromRepoLoading && (
						<Notification margin="x2" type="progress">
							Fetching bitrise.yml from the app repository...
						</Notification>
					)}

					{appConfigFromRepo && (
						<Notification margin="x2" type="success">
							Fetched bitrise.yml from app repository
						</Notification>
					)}

					{!getAppConfigFromRepoLoading && !appConfigFromRepo && (
						<Buttons alignChildrenHorizontal="end" margin="x8" gap="x6">
							<Button level="secondary" onClick={onClose}>
								Cancel
							</Button>
							<Button level="primary" onClick={getAppConfigFromRepo}>
								I'm done
							</Button>
						</Buttons>
					)}
				</Flex>
			</ModalBody>
		</Modal>
	);
};

export default UpdateYmlInRepositoryModal;
