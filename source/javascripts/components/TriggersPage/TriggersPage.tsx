import {
	Button,
	EmptyState,
	Link,
	Notification,
	Tab,
	TabList,
	Tabs,
	TabPanel,
	TabPanels,
	Text,
	useDisclosure,
} from "@bitrise/bitkit";
import AddPushTriggerDialog from "./AddPushTriggerDialog";

const TriggersPage = () => {
	const { isOpen: isNotificationOpen, onClose: closeNotification } = useDisclosure({ defaultIsOpen: true });
	const { isOpen: isDialogOpen, onOpen: openDialog, onClose: closeDialog } = useDisclosure();

	return (
		<>
			<Text as="h2" textStyle="heading/h2" marginBottom="4">
				Triggers
			</Text>
			<Text color="text/secondary">
				Triggers help you start builds automatically.{" "}
				<Link
					colorScheme="purple"
					href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
					isExternal
				>
					Learn more
				</Link>
			</Text>
			{isNotificationOpen && (
				<Notification status="info" onClose={closeNotification} action={{ label: "Set up webhooks" }} marginTop="32">
					<Text fontWeight="bold">Configure webhooks</Text>
					<Text>Enable Bitrise to interact with third-party services and are necessary for triggers to work.</Text>
				</Notification>
			)}
			<Tabs marginTop="24" marginBottom="24">
				<TabList>
					<Tab id="push">Push</Tab>
					<Tab id="pullRequest">Pull request</Tab>
					<Tab id="tag">Tag</Tab>
				</TabList>
				<TabPanels paddingTop="24">
					<TabPanel>
						<Button marginBottom="24" variant="secondary" onClick={openDialog} leftIconName="PlusAdd">
							Add push trigger
						</Button>
						<EmptyState iconName="Trigger" title="Your push triggers will appear here" maxHeight="208">
							<Text marginTop="8">
								A push based trigger automatically starts builds when commits are pushed to your repository.
							</Text>
							<Link
								colorScheme="purple"
								href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
							>
								Learn more
							</Link>
						</EmptyState>
					</TabPanel>
					<TabPanel>2</TabPanel>
					<TabPanel>3</TabPanel>
				</TabPanels>
			</Tabs>
			<AddPushTriggerDialog onClose={closeDialog} isOpen={isDialogOpen} />
		</>
	);
};

export default TriggersPage;
