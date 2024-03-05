import { Box, Collapse, Divider, Icon, Input, Link, MarkdownContent, Select, Text } from "@bitrise/bitkit";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { OnStepPropertyChange, Step, StepVersionWithRemark } from "../../models";
import MajorVersionChangeDialog from "./MajorVersionChangeDialog";
import { extractInputNames, extractStepFields } from "./utils";
import useVersionChange from "./useVersionChange";

type Props = {
	step: Step;
	versionsWithRemarks: Array<StepVersionWithRemark>;
	onChange: OnStepPropertyChange;
};

const StepProperties = ({ step, versionsWithRemarks, onChange }: Props) => {
	const { name, version, sourceURL, summary, description, isLibraryStep } = extractStepFields(step);
	const [showMore, setShowMore] = useState(false);

	const { register, setValue, handleSubmit } = useForm<Record<"name" | "version", string>>();
	const { createSnapshot, ...dialogProps } = useVersionChange(step);
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

			<Input {...register("name")} type="text" label="Name" placeholder="Step name" isRequired defaultValue={name} />
			<Divider />
			{isLibraryStep && (
				<Select {...register("version")} label="Version updates" isRequired defaultValue={version}>
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
			<MajorVersionChangeDialog {...dialogProps} />
		</Box>
	);
};

export default StepProperties;
