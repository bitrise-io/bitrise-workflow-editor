import React, { useEffect, useRef } from "react";
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
			"Find out how to set up code signing for your project type.",
		link: "https://devcenter.bitrise.io/en/code-signing.html"
	},
	{
		id: "secrets",
		title: "Secrets",
		description: "Find out how to set up secrets, how to edit them, expose them to pull requests and more.",
		link: "https://devcenter.bitrise.io/en/builds/secrets.html"
	},
	{
		id: "env-vars",
		title: "Env Vars",
		description:
			"Here you the define environment variables that the steps need to access in a build. " +
			"This can play a crucial role in ensuring your builds are successful.",
		link: "https://devcenter.bitrise.io/en/builds/environment-variables.html"
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
		title: "bitrise.yml",
		description:
			"There are two ways to build your workflows on Bitrise. " +
			"You can use the workflow editor to configure steps or you can edit the yml file in the yml editor.",
		link: "https://devcenter.bitrise.io/en/builds/configuring-build-settings/managing-an-app-s-bitrise-yml-file.html"
	}
];

interface ProductTourProps {
	menuIds: string[];
	currentUser: {tourShown: boolean};
}

// NOTE: Angular passes the menu items ids it will render,
// but we stil need to wait for the templates to render them before we can move on.
const useWaitForElements = (ids: string[], onFound: (ids: HTMLElement[]) => void) => {
	const timeoutRef = useRef<NodeJS.Timeout>();
	useEffect(() => {
		const checkIfReady = () => {
			const found = ids.map(id => document.getElementById(id)).filter(Boolean);
			if (found.length === ids.length) {
				onFound(found as HTMLElement[]);
				return;
			}
			timeoutRef.current = setTimeout(checkIfReady, 250);
		};

		checkIfReady();

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [ids, onFound]);
};

export const ProductTour = ({ menuIds, currentUser }: ProductTourProps) => {
	const [isOpen, setIsOpen] = useState(currentUser?.tourShown === false);
	const [validTips, setValidTips] = useState<Tips[] | null>(null);
	const [selectedId, setSelectedId] = useState("");

	const onClose = () => {
		setIsOpen(false);
	};

	useEffect(() => {
		if(currentUser?.tourShown === false && !isOpen) {
			setIsOpen(true);
		}
	},[currentUser?.tourShown])

	const onFound = useCallback(() => {
		const filtered = tips.filter(tip => menuIds.includes(tip.id));
		setValidTips(filtered);
		setSelectedId(filtered[0].id);
	}, []);

	useWaitForElements(menuIds, onFound);

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
