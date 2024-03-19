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

import AddPrTriggerDialog from "./AddPrTriggerDialog";
import AddPushTriggerDialog from "./AddPushTriggerDialog";
import AddTagTriggerDialog from "./AddTagTriggerDialog";
import TriggerCard from "./TriggerCard";
import { ConditionType, SourceType, TriggerItem } from "./TriggersPage.types";

type FinalTriggerItem = Record<string, boolean | string | { regex: string }>;

const convertItemsToTriggerMap = (triggers: TriggerItem[]): FinalTriggerItem[] => {
	const triggerMap: FinalTriggerItem[] = triggers.map((trigger) => {
		const finalItem: FinalTriggerItem = {};
		trigger.conditions.forEach(({ isRegex, type, value }) => {
			finalItem[type] = isRegex ? { regex: value } : value;
		});
		if (!trigger.isActive) {
			finalItem.enabled = false;
		}
		if (trigger.source === "pull_request" && !trigger.isDraftPr) {
			finalItem.draft_pull_request_enabled = false;
		}
		finalItem.workflow = trigger.pipelineable;
		return finalItem;
	});
	return triggerMap;
};

const getSourceType = (triggerKeys: string[]): SourceType => {
	if (triggerKeys.includes("push_branch")) {
		return "push";
	}
	if (triggerKeys.includes("tag")) {
		return "tag";
	}
	return "pull_request";
};

const convertTriggerMapToItems = (triggerMap: FinalTriggerItem[]): TriggerItem[] => {
	const items: TriggerItem[] = triggerMap.map((trigger) => {
		const triggerKeys = Object.keys(trigger);
		const finalItem: TriggerItem = {
			conditions: [],
			pipelineable: trigger.workflow as string,
			id: "",
			source: getSourceType(triggerKeys),
			isActive: trigger.enabled !== false,
		};
		triggerKeys.forEach((key) => {
			if (!["workflow", "enabled", "draft_pull_request_enabled"].includes(key)) {
				const isRegex = typeof trigger[key] !== "string";
				finalItem.conditions.push({
					isRegex: isRegex,
					type: key as ConditionType,
					value: isRegex ? (trigger[key] as { regex: string }).regex : (trigger[key] as string),
				});
			}
		});

		return finalItem;
	});
	return items;
};

type TriggersPageProps = {
	onTriggerMapChange: (triggerMap: FinalTriggerItem[]) => void;
	pipelineables: string[];
	triggerMap?: FinalTriggerItem[];
};

const TriggersPage = (props: TriggersPageProps) => {
	const { onTriggerMapChange, pipelineables, triggerMap } = props;
	const { isOpen: isNotificationOpen, onClose: closeNotification } = useDisclosure({ defaultIsOpen: true });
	const { isOpen: isTriggersNotificationOpen, onClose: closeTriggersNotification } = useDisclosure({
		defaultIsOpen: true,
	});
	const {
		isOpen: isPushTriggerDialogOpen,
		onOpen: openPushTriggerDialog,
		onClose: closePushTriggerDialog,
	} = useDisclosure();

	const { isOpen: isPrTriggerDialogOpen, onOpen: openPrTriggerDialog, onClose: closePrTriggerDialog } = useDisclosure();

	const {
		isOpen: isTagTriggerDialogOpen,
		onOpen: openTagTriggerDialog,
		onClose: closeTagTriggerDialog,
	} = useDisclosure();

	const [triggers, setTriggers] = useState<TriggerItem[]>(convertTriggerMapToItems(triggerMap || []));
	const [editedItem, setEditedItem] = useState<TriggerItem | undefined>();

	const onCloseDialog = () => {
		closePushTriggerDialog();
		closePrTriggerDialog();
		closeTagTriggerDialog();
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
		onTriggerMapChange(convertItemsToTriggerMap(newTriggers));
	};

	const onPushTriggerEdit = (trigger: TriggerItem) => {
		setEditedItem(trigger);
		openPushTriggerDialog();
	};

	const onPrTriggerEdit = (trigger: TriggerItem) => {
		setEditedItem(trigger);
		openPrTriggerDialog();
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
									onActiveChange={(trigger) => onTriggersChange("edit", trigger)}
								/>
							))}
						{pushTriggers.length > 1 && isTriggersNotificationOpen && (
							<Notification status="info" marginTop="12" onClose={closeTriggersNotification}>
								<Text fontWeight="bold">Order of triggers</Text>
								<Text>
									The first matching trigger is executed by the system, so make sure that the order of triggers is
									configured correctly.{" "}
									<Link
										href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
										isUnderlined
									>
										Learn more
									</Link>
								</Text>
							</Notification>
						)}
					</TabPanel>
					<TabPanel>
						{" "}
						<Button marginBottom="24" variant="secondary" onClick={openPrTriggerDialog} leftIconName="PlusAdd">
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
									onActiveChange={(trigger) => onTriggersChange("edit", trigger)}
								/>
							))}
						{prTriggers.length > 1 && isTriggersNotificationOpen && (
							<Notification status="info" marginTop="12" onClose={closeTriggersNotification}>
								<Text fontWeight="bold">Order of triggers</Text>
								<Text>
									The first matching trigger is executed by the system, so make sure that the order of triggers is
									configured correctly.{" "}
									<Link
										href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
										isUnderlined
									>
										Learn more
									</Link>
								</Text>
							</Notification>
						)}
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
									onActiveChange={(trigger) => onTriggersChange("edit", trigger)}
								/>
							))}
						{tagTriggers.length > 1 && isTriggersNotificationOpen && (
							<Notification status="info" marginTop="12" onClose={closeTriggersNotification}>
								<Text fontWeight="bold">Order of triggers</Text>
								<Text>
									The first matching trigger is executed by the system, so make sure that the order of triggers is
									configured correctly.{" "}
									<Link
										href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
										isUnderlined
									>
										Learn more
									</Link>
								</Text>
							</Notification>
						)}
					</TabPanel>
				</TabPanels>
			</Tabs>
			<AddPushTriggerDialog
				pipelineables={pipelineables}
				onClose={onCloseDialog}
				isOpen={isPushTriggerDialogOpen}
				onSubmit={onTriggersChange}
				editedItem={editedItem}
			/>
			<AddPrTriggerDialog
				isOpen={isPrTriggerDialogOpen}
				onClose={onCloseDialog}
				onSubmit={onTriggersChange}
				pipelineables={pipelineables}
				editedItem={editedItem}
			/>
			<AddTagTriggerDialog
				isOpen={isTagTriggerDialogOpen}
				onClose={onCloseDialog}
				onSubmit={onTriggersChange}
				pipelineables={pipelineables}
				editedItem={editedItem}
			/>
		</>
	);
};

export default TriggersPage;
