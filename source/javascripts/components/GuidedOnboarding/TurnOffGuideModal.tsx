import { Dialog, Button, Text, Link, DialogFooter, DialogBody } from "@bitrise/bitkit";
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
	
	const track = useTrackingFunction((item: string) => ({
		event: "Guided Onboarding Clicked",
		payload: {
			step: activeStepTitle,
			item
		}
	}));

	const handleClose = (): void => {
		track("Turn Off Guide Modal - close");
		onClose();
	}

	const handleTurnOffGuide = (): void => {
		track("Turn Off Guide Modal - turn off");
		onTurnOffGuide();
	}
  return (
    <Dialog
		backgroundColor="white"
		onClose={handleClose}
		isOpen={isOpen}
		color="purple.10"
		title="Turn off Getting Started Guide?"
	>
		<DialogBody>
			<Text paddingTop="10">
				If you turn off the Getting Started Guide, you will not get suggestions{" "}
				on how to get started with the key features of Bitrise.
			</Text>

			<Text paddingTop="20">
				You can turn it on any time in the{" "}
				<Link
					color="purple.50"
					href="/me/profile#/edit_profile"
					onClick={() => track("Profile Settings - Link")}
				>
					Profile Settings
				</Link>.
			</Text>
		</DialogBody>
		<DialogFooter>
			<Button variant="secondary" onClick={handleClose}>
				Cancel
			</Button>
			<Button variant="primary" onClick={handleTurnOffGuide}>
				Turn off
			</Button>
		</DialogFooter>
		</Dialog>
  );
};
