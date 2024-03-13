import {
	Button,
	EmptyState,
	Link,
	Notification,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Text,
	useDisclosure,
} from "@bitrise/bitkit";
import { useState } from "react";
import AddPushTriggerDialog from "./AddPushTriggerDialog";
import TriggerCard from "./TriggerCard";
import { TriggerItem } from "./TriggersPage.types";
import AddTagTriggerDialog from "./AddTagTriggerDialog";

type TriggersPageProps = {
	pipelineables: string[];
};

const TriggersPage = (props: TriggersPageProps) => {
	const { pipelineables } = props;
	const { isOpen: isNotificationOpen, onClose: closeNotification } = useDisclosure({ defaultIsOpen: true });
	const { isOpen: isTriggersNotificationOpen, onClose: closeTriggersNotification } = useDisclosure({
		defaultIsOpen: true,
	});
	const {
		isOpen: isPushTriggerDialogOpen,
		onOpen: openPushTriggerDialog,
		onClose: closePushTriggerDialog,
	} = useDisclosure();

	const {
		isOpen: isTagTriggerDialogOpen,
		onOpen: openTagTriggerDialog,
		onClose: closeTagTriggerDialog,
	} = useDisclosure();

	const [triggers, setTriggers] = useState<TriggerItem[]>([]);
	const [editedItem, setEditedItem] = useState<TriggerItem | undefined>();

	const onCloseDialog = () => {
		closePushTriggerDialog();
		setEditedItem(undefined);
	};

	const onTriggersChange = (action: "add" | "remove" | "edit", trigger: TriggerItem) => {
		let newTriggers = [...triggers];
		if (action === "add") {
			newTriggers.push(trigger);
		}
		if (action === "remove") {
			newTriggers = triggers.filter(({ id }) => id !== trigger.id);
		}
		if (action === "edit") {
			const index = triggers.findIndex(({ id }) => id === trigger.id);
			newTriggers[index] = trigger;
		}
		setTriggers(newTriggers);
	};

	const onPushTriggerEdit = (trigger: TriggerItem) => {
		setEditedItem(trigger);
		openPushTriggerDialog();
	};

	const onPrTriggerEdit = (trigger: TriggerItem) => {
		setEditedItem(trigger);
		//TODO
	};

	const onTagTriggerEdit = (trigger: TriggerItem) => {
		setEditedItem(trigger);
		openTagTriggerDialog();
	};

	const pushTriggers = triggers.filter(({ source }) => source === "push");

	const prTriggers = triggers.filter(({ source }) => source === "pull_request");

	const tagTriggers = triggers.filter(({ source }) => source === "tag");

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
						<Button marginBottom="24" variant="secondary" onClick={openPushTriggerDialog} leftIconName="PlusAdd">
							Add push trigger
						</Button>
						{pushTriggers.length === 0 && (
							<EmptyState iconName="Trigger" title="Your push triggers will appear here" maxHeight="208">
								<Text marginTop="8">
									A push based trigger automatically starts builds when commits are pushed to your repository.{" "}
									<Link
										colorScheme="purple"
										href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
									>
										Learn more
									</Link>
								</Text>
							</EmptyState>
						)}
						{pushTriggers.length > 0 &&
							pushTriggers.map((triggerItem) => (
								<TriggerCard
									key={triggerItem.id}
									triggerItem={triggerItem}
									onRemove={(trigger) => onTriggersChange("remove", trigger)}
									onEdit={(trigger) => onPushTriggerEdit(trigger)}
								/>
							))}
					</TabPanel>
					<TabPanel>
						{" "}
						<Button marginBottom="24" variant="secondary" onClick={openPushTriggerDialog} leftIconName="PlusAdd">
							Add pull request trigger
						</Button>
						{prTriggers.length === 0 && (
							<EmptyState iconName="Trigger" title="Your pull request triggers will appear here" maxHeight="208">
								<Text marginTop="8">
									A pull request based trigger automatically starts builds when specific PR related actions detected
									within your repository.{" "}
									<Link
										colorScheme="purple"
										href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
									>
										Learn more
									</Link>
								</Text>
							</EmptyState>
						)}
						{prTriggers.length > 0 &&
							prTriggers.map((triggerItem) => (
								<TriggerCard
									key={triggerItem.id}
									triggerItem={triggerItem}
									onRemove={(trigger) => onTriggersChange("remove", trigger)}
									onEdit={(trigger) => onPrTriggerEdit(trigger)}
								/>
							))}
					</TabPanel>
					<TabPanel>
						<Button marginBottom="24" variant="secondary" onClick={openTagTriggerDialog} leftIconName="PlusAdd">
							Add tag trigger
						</Button>
						{tagTriggers.length === 0 && (
							<EmptyState iconName="Trigger" title="Your tag triggers will appear here" maxHeight="208">
								<Text marginTop="8">
									A tag-based trigger automatically starts builds when tags gets pushed to your repository.{" "}
									<Link
										colorScheme="purple"
										href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
									>
										Learn more
									</Link>
								</Text>
							</EmptyState>
						)}
						{tagTriggers.length > 0 &&
							tagTriggers.map((triggerItem) => (
								<TriggerCard
									key={triggerItem.id}
									triggerItem={triggerItem}
									onRemove={(trigger) => onTriggersChange("remove", trigger)}
									onEdit={(trigger) => onTagTriggerEdit(trigger)}
								/>
							))}
					</TabPanel>
				</TabPanels>
			</Tabs>
			{triggers.length > 1 && isTriggersNotificationOpen && (
				<Notification status="info" marginTop="12" onClose={closeTriggersNotification}>
					<Text fontWeight="bold">Order of triggers</Text>
					<Text>
						The first matching trigger is executed by the system, so make sure that the order of triggers is configured
						correctly.{" "}
						<Link
							href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
							isUnderlined
						>
							Learn more
						</Link>
					</Text>
				</Notification>
			)}
			<AddPushTriggerDialog
				pipelineables={pipelineables}
				onClose={onCloseDialog}
				isOpen={isPushTriggerDialogOpen}
				onSubmit={onTriggersChange}
				editedItem={editedItem}
			/>
			<AddTagTriggerDialog
				isOpen={isTagTriggerDialogOpen}
				onClose={closeTagTriggerDialog}
				onSubmit={onTriggersChange}
				pipelineables={pipelineables}
				editedItem={editedItem}
			/>
		</>
	);
};

export default TriggersPage;
