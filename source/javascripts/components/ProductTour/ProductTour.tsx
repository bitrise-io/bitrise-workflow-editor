import React, { useEffect } from "react";
import { useCallback, useState } from "react";
import { Highlighter, useHighlighter } from "./Highlighter";
import { ProductTooltip } from "./ProductTooltip";
import { Tips } from "./types";

const tips: Tips[] = [
	{
		id: "workflows",
		title: "Welcome to the workflow editor",
		description:
			"Here you can build workflows using our library of steps and automate tasks to replace repetitive, manual processes."
	},
	{
		id: "code-signing",
		title: "Code signing",
		description:
			"Here you can upload sensitive files to Bitrise to allow you to distribute your app." +
			"Find out how to set up code signing for your project type."
	},
	{
		id: "secrets",
		title: "Secrets",
		description: "Find out how to set up secrets, how to edit them, expose them to pull requests and more. Learn more"
	},
	{
		id: "env-vars",
		title: "Env Vars",
		description:
			"Here you the define environment variables that the steps need to access in a build. " +
			"This can play a crucial role in ensuring your builds are successful. Learn more"
	},
	{
		id: "triggers",
		title: "Triggers",
		description: "No tooltip is required here as the info is already on the page."
	},
	{
		id: "stack",
		title: "Stacks & machines",
		description:
			"On this tab, you can update the stack version (make sure it matches that of your project). " +
			"You can also set the machine type to change the speed/cost of your builds."
	},
	{
		id: "yml",
		title: "yml.bitrise",
		description:
			"There are two ways to build your workflows on Bitrise. " +
			"You can use the workflow editor to configure steps or you can edit the yml file in the yml editor. Learn more"
	}
];

export const ProductTour = () => {
	const [isOpen, setIsOpen] = useState(true);
	const [validTips, setValidTips] = useState<Tips[] | null>(null);

	const onClose = () => {
		setIsOpen(false);
	};

	// NOTE: need to evaluate what menu items are present after mount
	useEffect(() => {
		// TODO: for some reason the template isn't ready at this point
		// we probably need to observe the menu item chnges
		setTimeout(() => {
			const filtered = tips.filter(tip => !!document.getElementById(tip.id));
			if (filtered.length > 0) {
				setValidTips(filtered);
			}
		}, 1000);
	}, []);

	const [selectedId, setSelectedId] = useState(tips?.[0]?.id);

	const { rect, clipPath } = useHighlighter(selectedId);

	const onChange = useCallback(id => {
		setSelectedId(id);
	}, []);

	if (!validTips) {
		return null;
	}

	return (
		<Highlighter isOpen={isOpen} rect={rect!} clipPath={clipPath}>
			<ProductTooltip onChange={onChange} onClose={onClose} rect={rect} tips={validTips} />
		</Highlighter>
	);
};
