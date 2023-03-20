import { Tips } from "./types";

export const tips: Tips[] = [
	{
		id: "menu-nav",
		title: "Welcome to the Workflow Editor",
		description: 
			"Here you can build Workflows and set up everything your app needs for testing and deployment. " 
			+ "You can also change the machine type for your builds.",
		position: "bottom",
	},
	{
		id: "workflow-main-toolbar",
		title: "Default Workflows",
		description:
			"A Bitrise Workflow is a collection of Steps. Each new app comes with a Primary and Deploy Workflow. "
			+ "You can edit these or start new Workflows from scratch.",
		position: "bottom",
	},
	{
		id: "steps-container",
		title: "Steps",
		description: 
			"Click on the + symbol at the point you want to add a Step and then select the desired Step from our library. "
			+ "You can also drag and drop the Steps in a Workflow.",
		position: "right",
	},
];
