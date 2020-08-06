import React, { FC, useEffect } from "react";
import { Modal, ModalBody, Flex, ModalTitle, Buttons, Button, Text, Notification } from "@bitrise/bitkit";
import RepoYmlStorageActions from "../common/RepoYmlStorageActions";
import { AppConfig } from "../../models/AppConfig";
import useGetAppConfigFromRepoCallback from "../../hooks/api/useGetAppConfigFromRepoCallback";

type Props = {
	appSlug: string;
	onClose(): void;
	onComplete(appConfig: AppConfig): void;
	dataToSave: AppConfig | string;
};

const UpdateYmlInRepositoryModal: FC<Props> = ({ appSlug, dataToSave, onClose, onComplete }: Props) => {
	const { getAppConfigFromRepoLoading, getAppConfigFromRepo, appConfigFromRepo } = useGetAppConfigFromRepoCallback(
		appSlug
	);

	useEffect(() => {
		if (appConfigFromRepo) {
			onComplete(appConfigFromRepo);
		}
	}, [appConfigFromRepo]);

	return (
		<Modal backgroundColor="white" onClose={onClose} visible={true} width="640px">
			<ModalBody>
				<Flex direction="vertical" gap="x4">
					<ModalTitle>Update bitrise.yml in app repository</ModalTitle>
					<Text textColor="gray-8">
						In order to use the changes in the next build, you need to update the bitrise.yml on master branch in the
						app repository manually.
					</Text>
					<RepoYmlStorageActions appConfig={dataToSave} />
					<Text textColor="gray-8">
						After you are done, Bitrise will fetch the updated bitrise.yml from the app repository and refresh the
						editor. Unsaved changes will be lost.
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
								I&apos;m done
							</Button>
						</Buttons>
					)}
				</Flex>
			</ModalBody>
		</Modal>
	);
};

export default UpdateYmlInRepositoryModal;
