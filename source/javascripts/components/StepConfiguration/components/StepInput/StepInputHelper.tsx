import { Collapse, Link, MarkdownContent, useDisclosure } from "@bitrise/bitkit";
import { FormHelperText } from "@chakra-ui/react";

type Props = {
	summary?: string;
	details?: string;
};

// TODO: Add "sm" size to MarkdownContent component in Bitkit and eliminate "sm" as "md" hacks.
// TODO: Add "gap" property to the MarkdownContent in Bitkit and set it to "8" here.
const StepInputHelper = ({ summary, details }: Props) => {
	const { isOpen, onToggle } = useDisclosure();

	if (!summary && !details) {
		return null;
	}

	const showMoreLabel = isOpen ? "Show less" : "Show more";

	return (
		<FormHelperText display="flex" flexDirection="column" gap="8">
			{summary && <MarkdownContent md={summary} size={"sm" as "md"} />}
			{details && (
				<>
					<Collapse in={isOpen}>
						<MarkdownContent md={details} size={"sm" as "md"} />
					</Collapse>
					<Link colorScheme="purple" cursor="pointer" size="2" onClick={onToggle}>
						{showMoreLabel}
					</Link>
				</>
			)}
		</FormHelperText>
	);
};

export default StepInputHelper;
