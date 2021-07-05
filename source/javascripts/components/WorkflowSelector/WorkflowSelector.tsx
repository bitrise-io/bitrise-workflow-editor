import {
	PlacementManager,
	PlacementReference,
	Text,
	Icon,
	Placement,
	Flex,
	Input,
	InputContainer,
	InputContent,
} from "@bitrise/bitkit";
import React, { useState, useMemo, useEffect } from "react";
import { Workflow } from "../../models";
import WorkflowSelectorItem from "./WorkflowSelectorItem/WorkflowSelectorItem";
import "./WorkflowSelector.scss";

interface WorkflowSelectorProps {
	selectedWorkflowId: string;
	workflows: Workflow[];
	selectWorkflow: (workflow: Workflow) => void;
	renameWorkflowConfirmed: (workflow: Workflow, newWorkflowID: string) => void;
}

const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({
	selectedWorkflowId,
	workflows,
	selectWorkflow,
	renameWorkflowConfirmed,
}: WorkflowSelectorProps) => {
	const [visible, setVisible] = useState(false);
	const [search, setSearch] = useState("");

	const onItemClick = (workflow: Workflow): void => {
		selectWorkflow(workflow);
		setVisible(false);
		setSearch("");
	};

	const onEscPress = ({ key }: KeyboardEvent): void => {
		if (key === "Escape") {
			setVisible(false);
			setSearch("");
		}
	};

	useEffect(() => {
		document.addEventListener("keydown", onEscPress, false);
		return () => {
			document.removeEventListener("keydown", onEscPress, false);
		};
	}, []);

	const filteredWorkflows = useMemo(() => {
		let result = [...workflows];
		if (search) {
			const regExp = new RegExp(search, "i");
			result = workflows.filter((workflow) => regExp.test(workflow.id));
		}

		return result;
	}, [workflows, search]);

	const workflowIds = useMemo(() => {
		return workflows.map((workflow) => workflow.id);
	}, [workflows]);

	const onClearSearch = (): void => {
		setTimeout(() => setSearch(""), 0);
	};

	const onClose = (): void => {
		setVisible(false);
		setSearch("");
	};

	return (
		<PlacementManager>
			<PlacementReference>
				{({ ref }) => (
					<Flex
						height="43px"
						borderRadius="x1"
						borderColor="gray-6"
						innerRef={ref}
						overflow="hidden"
						direction="horizontal"
						data-e2e-tag="workflow-selector"
					>
						<Flex
							width="7rem"
							backgroundColor="gray-6"
							textColor="white"
							direction="horizontal"
							alignChildrenHorizontal="middle"
							alignChildrenVertical="middle"
						>
							<Text config="8" uppercase>
								Workflow
							</Text>
						</Flex>
						<Flex
							className="WorkflowSelectorDropdown"
							padding="x3"
							direction="horizontal"
							grow
							clickable
							alignChildrenVertical="middle"
							alignChildrenHorizontal="between"
							onClick={() => setVisible(true)}
							data-e2e-tag="workflow-selector-dropdown"
						>
							<Text
								grow
								textColor="gray-6"
								width="114px"
								overflow="hidden"
								ellipsis
								data-e2e-tag="workflow-selector-selected-workflow-name"
							>
								{selectedWorkflowId}
							</Text>
							<Icon size="1.25rem" textColor="gray-6" name="ChevronDown" />
						</Flex>
					</Flex>
				)}
			</PlacementReference>

			<Placement onClose={onClose} visible={visible}>
				{() => (
					<Flex width="560px">
						<Flex padding="x3">
							<InputContainer>
								<InputContent>
									<Icon name="Magnifier" />
									<Input
										autoFocus
										placeholder="Search workflows..."
										value={search}
										onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setSearch(ev.target.value)}
									/>
									{search && (
										<Text className="SearchField_reset" config="8" uppercase clickable onClick={onClearSearch}>
											Reset
										</Text>
									)}
								</InputContent>
							</InputContainer>
						</Flex>
						{filteredWorkflows.length ? (
							<Flex maxHeight="360px" overflow="scroll" data-e2e-tag="workflow-selector-list">
								{filteredWorkflows.map((workflow) => (
									<WorkflowSelectorItem
										key={workflow.id}
										workflow={workflow}
										selectWorkflow={onItemClick}
										selectedWorkflowId={selectedWorkflowId}
										workflowIds={workflowIds}
										renameWorkflowConfirmed={renameWorkflowConfirmed}
										data-e2e-tag="workflow-selector-option"
									/>
								))}
							</Flex>
						) : (
							<Flex textColor="gray-6" gap="x3" direction="vertical" alignChildren="middle" padding="x5">
								<Icon name="BitbotFailed" size="2.5rem" />
								<Flex direction="vertical" alignChildren="middle" gap="x1">
									<Text weight="bold">No workflows found.</Text>
									<Text>Modify or reset the search.</Text>
								</Flex>
							</Flex>
						)}
					</Flex>
				)}
			</Placement>
		</PlacementManager>
	);
};

export default WorkflowSelector;
