import { Box, Dialog, DialogBody, DialogFooter, Link, ProgressBitbot } from "@bitrise/bitkit";
import { load } from "js-yaml";
import { useEffect, useMemo, useState } from "react";
import useMonolithApiCallback from "../hooks/api/useMonolithApiCallback";
import RecipeChooser from "./RecipeChooser";
import WorkflowChooser from "./WorkflowChooser";

type RecipeJson = { markdown: string; tags: string[] };

const Poller = ({ onDone, id, slug }: { onDone: (result: string) => void; id: string; slug: string }): JSX.Element => {
	const result = useMonolithApiCallback<{yaml:string}>(
		`/api/apps/${slug}/bitrise_ai_configs/${id}`,
	);

	useEffect(() => {
		const interval = setInterval(() => result.call(), 2000);
		return () => clearInterval(interval);
	}, [result.call]);

	useEffect(() => {
		if (!result.failed && !result.loading && result.result) {
			onDone(result.result.yaml);
		}
	}, [result.result, result.loading, result.failed]);
	return <ProgressBitbot />;
};
const RecipeDialog = ({
	isOpen,
	onClose,
	slug,
	appConfigYml
}: {
	isOpen: boolean;
	appConfigYml?: string;
	onClose: (yml?: string) => void;
	slug: string;
}): JSX.Element => {
	const [state, setState] = useState<"recipe" | "workflow" | "waiting">("recipe");
	const [selectedRecipe, setSelectedRecipe] = useState<RecipeJson>();
	const workflows = useMemo(() => (appConfigYml ? Object.keys(load(appConfigYml).workflows) : []), [appConfigYml]);
	const onSelected = (r: RecipeJson): void => {
		setSelectedRecipe(r);
		setState("workflow");
	};
	const update = useMonolithApiCallback<{ prompt_id: string }>(`/api/apps/${slug}/bitrise_ai_configs`, {
		method: "POST"
	});
	const onWorkflowSelected = (w: string[] | null): void => {
		update.call({
			body: JSON.stringify({ workflows: w, yaml: appConfigYml, recipe_content: selectedRecipe?.markdown })
		});
		setState("waiting");
	};
	return (
		<Dialog width="80%" maxWidth="80%" isOpen={isOpen} onClose={onClose} title="Config generator">
			<DialogBody>
				{state === "recipe" && <RecipeChooser onSelected={onSelected} />}
				{state === "workflow" && (
					<WorkflowChooser
						onBack={() => setState("recipe")}
						workflows={workflows}
						setSelectedWorkflow={onWorkflowSelected}
					/>
				)}
				{state === "waiting" && update.result?.prompt_id && (
						<Poller onDone={onClose} id={update.result.prompt_id} slug={slug} />
				)}
			</DialogBody>
			<DialogFooter>
				<Box display="flex" flexDirection="row" justifyContent="space-between">
					<Link href="#" isExternal>
						View recipes on GitHub
					</Link>
				</Box>
			</DialogFooter>
		</Dialog>
	);
};

export default RecipeDialog;
