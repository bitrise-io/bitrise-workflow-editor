import React, { FC, useState } from "react";
import { Modal, ModalHeader, ModalBody, Flex, ModalTitle, Buttons, Button, Text } from "@bitrise/bitkit";
import "./SplashModal.scss";

const SplashModal: FC<void> = () => {
	const [visible, setVisible] = useState(true);

	const handleNavigation = (): void => {
		const { origin, pathname } = window.location;
		window.location.href = `${origin}${pathname}#!/yml`;
		window.location.reload();
	};

	return (
		<Modal backgroundColor="white" onClose={() => setVisible(false)} visible={visible} width="640px">
			<ModalHeader />
			<ModalBody>
				<Flex>
					<ModalTitle>Store and manage the bitrise.yml file in your app's repository!</ModalTitle>
					<Flex direction="vertical" gap="x6">
						<Text textColor="gray-8">
							The bitrise.yml file is the heart of your Bitrise experience: it contains all your Workflows, and stores
							your specific configuration for your app. And now you can manage it from your own repository: maintain it
							and version it using Git, just like you're doing with the rest of your code!
						</Text>
						<Text textColor="gray-8">
							Try it out! Don't worry: you can always change it back to the original way where we handle the file for
							you. To do so, you just need to go to the bitrise.yml tab in the Workflow Editor.
						</Text>
					</Flex>
				</Flex>
				<Buttons alignChildrenHorizontal="end" margin="x8" gap="x6">
					<Button level="secondary" onClick={() => setVisible(false)}>
						Maybe later
					</Button>
					<Button level="primary" onClick={handleNavigation}>
						Take me there
					</Button>
				</Buttons>
			</ModalBody>
		</Modal>
	);
};

export default SplashModal;
