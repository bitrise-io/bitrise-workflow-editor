import { Box, Collapse, Divider, Icon, Input, Link, MarkdownContent, Select, Text } from "@bitrise/bitkit";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { OnStepPropertyChange, Step, StepVersionWithRemark } from "../models";

type StepPropertiesProps = {
	workflowIndex: number;
	step: Step;
	versionsWithRemarks: Array<StepVersionWithRemark>;
	onChange: OnStepPropertyChange;
};

const StepProperties = ({ step, versionsWithRemarks, onChange }: StepPropertiesProps) => {
	const { name, version, sourceURL, isLibraryStep, summary, description } = useMemo(() => {
		return {
			name: step.displayName(),
			version: step.requestedVersion() || "",
			sourceURL: step.sourceURL(),
			summary: step.summary(),
			description: step.description(),
			isLibraryStep: step.isLibraryStep(),
		};
	}, [step.displayName(), step.requestedVersion()]);
	const [showMore, setShowMore] = useState(false);
	const { register, setValue, handleSubmit } = useForm<Record<"name" | "version", string>>();

	useEffect(() => {
		setValue("name", name);
		setValue("version", version);
	}, [step]);

	return (
		<Box
			as="form"
			display="flex"
			flexDirection="column"
			p="24"
			gap="24"
			onChange={handleSubmit((values) => {
				console.log("handleSubmit", values);
				onChange(values);
			})}
		>
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
		</Box>
	);
};

export default StepProperties;
