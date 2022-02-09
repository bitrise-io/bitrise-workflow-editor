import React from "react";
import { Flex, Modal, ModalBody, Icon, ModalTitle, Buttons, Button, Text } from "@bitrise/bitkit";
import "./ConfirmSwitchToRepositoryYml.scss";

type Props = {
	visible: boolean;
	onContinue(): void;
	onCancel(): void;
};

const ConfirmSwitchToRepositoryYml: React.FC<Props> = ({ visible, onContinue, onCancel }: Props) => (
	<Modal width="640px" visible={visible}>
		<ModalBody>
			<Flex direction="vertical" gap="x8">
				<Icon textColor="grape-4" name="Warning" size="40px" />
				<Flex>
					<ModalTitle>Make sure your bitrise.yml file is valid!</ModalTitle>
					<Text textColor="gray-7" size="3">
						You need a valid bitrise.yml file on the main branch - the one you set up when you added the app to Bitrise
						- of your app before proceeding. A missing or invalid bitrise.yml file might break your build pipeline!
					</Text>
				</Flex>
				<Buttons alignChildrenHorizontal="end" margin="x8" gap="x6">
					<Button level="secondary" onClick={onCancel}>
						Cancel
					</Button>
					<Button level="primary" onClick={onContinue}>
						Continue
					</Button>
				</Buttons>
			</Flex>
		</ModalBody>
	</Modal>
);

export default ConfirmSwitchToRepositoryYml;
