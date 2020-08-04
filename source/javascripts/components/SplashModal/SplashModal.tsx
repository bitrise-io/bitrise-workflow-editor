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
					<ModalTitle>Store and manage bitrise.yml in app repository</ModalTitle>
					<Flex direction="vertical" gap="x4">
						<Text textColor="gray-8">
							Some content about the feature and benefits. Eu egestas egestas nunc fermentum est, in eget non. Ornare
							bibendum dignissim non nunc.
						</Text>
						<Text textColor="gray-8">You can switch to repo yml later under the bitrise.yml tab.</Text>
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
