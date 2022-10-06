import React from "react";
import { Modal, ModalBody, Flex, ModalTitle, Buttons, Button, Text, Link, Icon } from "@bitrise/bitkit";

import "./GuidedOnboardingContent.scss";
import { useTrackingFunction } from "../../hooks/utils/useTrackingFunction";

interface TurnOffGuideModalProps {
	isOpen?: boolean;
	onClose: () => void;
	onTurnOffGuide: () => void;
	activeStepTitle: string;
}

export const TurnOffGuideModal = ({
	isOpen = false,
	onClose,
	onTurnOffGuide,
	activeStepTitle
}: TurnOffGuideModalProps): JSX.Element => {
	
	const trackClose = useTrackingFunction(() => ({
		event: "Close Turn Off Guide Modal",
		payload: {
			step: activeStepTitle,
		}
	}));

	const trackTurnOff = useTrackingFunction(() => ({
		event: "Turn Off Guide",
		payload: {
			step: activeStepTitle,
		}
	}));

	const handleClose = (): void => {
		trackClose();
		onClose();
	}

	const handleTurnOffGuide = (): void => {
		trackTurnOff();
		onTurnOffGuide();
	}

  return (
    <Modal
		className="guided-onboarding-turn-off-modal"
		backgroundColor="white"
		onClose={handleClose}
		visible={isOpen}
		width="640px"
	>
			<ModalBody>
				<Flex direction="vertical" gap="x6">
					<ModalTitle>
						<Flex direction="horizontal" alignChildrenHorizontal="between">
							<Text size="5">Turn off onboarding guide?</Text>
							<Button onClick={handleClose} level="tertiary" style={{ padding: "0" }}>
								<Icon name="CloseSmall" textColor="grape-5" />
							</Button>
						</Flex>
					</ModalTitle>

					<Text size='3'>
						If you turn off the onboarding guide, you will not get suggestions{" "}
						on how to get started with the key features of Bitrise.
					</Text>

					<Text size='3'>
					You can turn it on any time in <Link href="/me/profile#/edit_profile">Profile settings</Link>.
					</Text>

					<Buttons alignChildrenHorizontal="end" margin="x8" gap="x6">
						<Button level="secondary" onClick={handleClose}>
							Cancel
						</Button>
						<Button level="primary" onClick={handleTurnOffGuide}>
							Turn off
						</Button>
					</Buttons>
				</Flex>
			</ModalBody>
		</Modal>
  );
};
