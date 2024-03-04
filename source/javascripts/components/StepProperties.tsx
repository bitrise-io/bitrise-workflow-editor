import {
	Box,
	Collapse,
	Divider,
	Icon,
	Input,
	Link,
	MarkdownContent,
	Select,
	Text,
	useDisclosure,
} from "@bitrise/bitkit";
import { useEffect, useReducer, useState } from "react";
import { useForm } from "react-hook-form";
import { OnStepPropertyChange, Step, StepVersionWithRemark } from "../models";
import MajorVersionChangeDialog from "./MajorVersionChangeDialog";
import semverService from "../services/semver-service";

const extractStepFields = (step: Step) => {
	return {
		name: step.displayName(),
		version: step.requestedVersion() || "",
		sourceURL: step.sourceURL(),
		summary: step.summary(),
		description: step.description(),
		isLibraryStep: step.isLibraryStep(),
	};
};

const extractReleaseNotesUrl = (step: Step) => {
	let releaseUrl = step.defaultStepConfig["source_code_url"] || "";
	if (releaseUrl.startsWith("https://github.com")) {
		releaseUrl += "/releases";
	}
	return releaseUrl;
};

const extractInputNames = (step: Step) =>
	step.defaultStepConfig.inputs
		.map((inputObj) => Object.keys(inputObj).find((k) => k !== "opts") || "")
		.filter((i) => !!i);

type ReducerState = { oldHashKey: string; oldVersion: string; oldInputNames: Array<string> };
const DefaultState: ReducerState = { oldHashKey: "", oldVersion: "", oldInputNames: [] };

const useVersionChange = (step: Step) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [{ oldHashKey, oldVersion, oldInputNames }, dispatch] = useReducer(
		(state: ReducerState, partialState: Partial<ReducerState>) => ({ ...state, ...partialState }),
		DefaultState,
	);

	const isSameStep = oldHashKey === step.$$hashKey;

	// Calculate input changes between different step versions
	const newInputNames = extractInputNames(step);
	const removedInputs = oldInputNames.filter((name) => !newInputNames.includes(name));
	const newInputs = newInputNames.filter((name) => !oldInputNames.includes(name));
	const hasInputChanged = removedInputs.length > 0 || newInputs.length > 0;

	// Calculate version changes
	const newVersion = step.version;
	const isVersionChanged = Boolean(oldVersion && newVersion && oldVersion !== newVersion);
	const isMajorChange = Boolean(oldVersion && newVersion && semverService.isMajorVersionChange(oldVersion, newVersion));
	const shouldOpenChangeDialog = isSameStep && (isMajorChange || (isVersionChanged && hasInputChanged));

	useEffect(() => {
		if (shouldOpenChangeDialog) {
			onOpen();
		}
	}, [shouldOpenChangeDialog, onOpen, newVersion]);

	useEffect(() => {
		if (step.$$hashKey !== oldHashKey) {
			dispatch(DefaultState);
		}
	}, [oldHashKey, step.$$hashKey]);

	const result = {
		isOpen,
		close: onClose,
		isMajorChange,
		releaseNotesUrl: extractReleaseNotesUrl(step),
		removedInputs,
		newInputs,
		createSnapshot: ({ oldHashKey, oldVersion, oldInputNames }: ReducerState) =>
			dispatch({
				oldHashKey,
				oldVersion,
				oldInputNames,
			}),
	};

	return result;
};

type StepPropertiesProps = {
	step: Step;
	versionsWithRemarks: Array<StepVersionWithRemark>;
	onChange: OnStepPropertyChange;
};

const StepProperties = ({ step, versionsWithRemarks, onChange }: StepPropertiesProps) => {
	const { name, version, sourceURL, summary, description, isLibraryStep } = extractStepFields(step);
	const [showMore, setShowMore] = useState(false);

	const { register, setValue, handleSubmit } = useForm<Record<"name" | "version", string>>({
		defaultValues: { name, version },
	});
	const { isOpen, close, createSnapshot, releaseNotesUrl, isMajorChange, removedInputs, newInputs } =
		useVersionChange(step);
	const handleChange = handleSubmit((values) => {
		createSnapshot({
			oldHashKey: step.$$hashKey,
			oldVersion: step.defaultStepConfig.version,
			oldInputNames: extractInputNames(step),
		});
		onChange(values);
	});

	useEffect(() => {
		setValue("name", name);
		setValue("version", version);
	}, [name, version, setValue]);

	return (
		<Box as="form" display="flex" flexDirection="column" p="24" gap="24" onChange={handleChange}>
			{sourceURL && (
				<Link
					display="flex"
					alignItems="center"
					alignSelf="start"
					gap="4"
					href={sourceURL}
					target="_blank"
					rel="noreferrer noopener"
					colorScheme="purple"
					isExternal
				>
					<Text>View source code</Text>
					<Icon name="OpenInBrowser" />
				</Link>
			)}

			<Input
				{...register("name")}
				type="text"
				label="Name"
				placeholder="Step name"
				isRequired
				defaultValue={name}
				// helperText={JSON.stringify({ title: step.displayName(), value: watch("name") })}
			/>
			<Divider />
			{isLibraryStep && (
				<Select
					{...register("version")}
					label="Version updates"
					isRequired
					defaultValue={version}
					// helperText={JSON.stringify({
					// 	requestedVersion: version,
					// 	value: watch("version"),
					// })}
				>
					{versionsWithRemarks.map(({ version: value, remark }) => {
						return (
							<option key={value} value={value || ""}>
								{value || "Always latest"} - {remark}
							</option>
						);
					})}
				</Select>
			)}
			<Divider />
			<Box display="flex" flexDirection="column" gap="8">
				<Text size="2" fontWeight="600">
					Summary
				</Text>
				{summary && <MarkdownContent md={summary} />}
				{description && (
					<>
						<Collapse in={showMore} transition={{ enter: { duration: 0.2 }, exit: { duration: 0.2 } }}>
							<MarkdownContent md={description} />
						</Collapse>
						<Link as="button" alignSelf="self-start" colorScheme="purple" onClick={() => setShowMore((prev) => !prev)}>
							{showMore ? "Show less" : "Show more"}
						</Link>
					</>
				)}
			</Box>
			<MajorVersionChangeDialog
				isOpen={isOpen}
				isMajorChange={isMajorChange}
				onClose={close}
				releaseNotesUrl={releaseNotesUrl}
				removedInputs={removedInputs}
				newInputs={newInputs}
			/>
		</Box>
	);
};

export default StepProperties;
