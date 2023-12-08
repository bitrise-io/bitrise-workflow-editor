import { Toggle as BitkitToggle, ToggleProps as BitkitToggleProps, Box, Tooltip } from "@bitrise/bitkit";

type ToggleProps = {
	tooltipLabel?: string;
	onChange(isChecked: boolean): void;
	isWorking: boolean;
	wrappedIsChecked: {
		checked: boolean;
	};
} & Pick<BitkitToggleProps, "isDisabled" | "isChecked">;

const Toggle = (props: ToggleProps) => {
	const { tooltipLabel, isChecked, wrappedIsChecked, ...rest } = props;

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		props?.onChange(event.target.checked);
	};

	if (tooltipLabel) {
		return (
			<Tooltip label={tooltipLabel}>
				<Box>
					<BitkitToggle {...rest} isChecked={wrappedIsChecked.checked} onChange={handleChange} />
					{isChecked ? "true" : "false"}
				</Box>
			</Tooltip>
		);
	}

	return <BitkitToggle {...rest} onChange={handleChange} />;
};

export default Toggle;
