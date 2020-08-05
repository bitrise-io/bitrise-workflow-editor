import React from "react";
import { Flex, Modal, ModalBody, Icon, ModalTitle, Buttons, Button, Text } from "@bitrise/bitkit";
import "./ConfirmSwitchToRepositoryYml.scss";

type Props = {
	visible: boolean;
	onContinue(): void;
	onCancel(): void;
};

const ConfirmSwitchToRepositoryYml: React.FC<Props> = ({ visible, onContinue, onCancel }: Props) => (
	<Modal width="440px" visible={visible}>
		<ModalBody>
			<Flex direction="vertical" gap="x6">
				<Icon textColor="grape-4" name="Warning" size="40px" />
				<Flex>
					<ModalTitle>Check bitrise.yml</ModalTitle>
					<Text textColor="gray-7" config="7">
						Make sure that you added the valid bitrise.yml on the master branch to the app repository before proceeding.
						Missing or invalid bitrise.yml may break your build pipeline.
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
