import { Badge, Box, Text, Tooltip } from "@bitrise/bitkit";
import { FormLabel } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
	isSensitive?: boolean;
}>;

const StepInputLabel = ({ children, isSensitive }: Props) => {
	if (!children && !isSensitive) {
		return null;
	}

	return (
		<Box display="flex" alignItems="flex-end" justifyContent="space-between" mb="4">
			{children && (
				<FormLabel
					requiredIndicator={null}
					optionalIndicator={
						<Text as="span" color="neutral.40" fontSize="2" fontWeight="normal" marginLeft="4px">
							(Optional)
						</Text>
					}
				>
					{children}
				</FormLabel>
			)}

			{isSensitive && (
				<Tooltip
					shouldWrapChildren
					label="This input holds sensitive information. You can only use secrets to securely reference it."
				>
					<Badge color="yellow.40" backgroundColor="yellow.93">
						SENSITIVE
					</Badge>
				</Tooltip>
			)}
		</Box>
	);
};

export default StepInputLabel;
