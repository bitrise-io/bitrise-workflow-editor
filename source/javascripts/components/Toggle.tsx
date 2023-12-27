import { Toggle as BitkitToggle, ToggleProps as BitkitToggleProps, Box, Tooltip } from "@bitrise/bitkit";

type ToggleProps = {
	tooltipLabel?: string;
	onChange(isChecked: boolean, listItemId?: string): boolean;
	isChecked: boolean;
	// if toggle is used in a loop this can be used the identify what data is connected to this toggle
	listItemId?: string;
} & Pick<BitkitToggleProps, "isDisabled">;

const Toggle = (props: ToggleProps) => {
	const { tooltipLabel, isChecked, onChange, listItemId, ...rest } = props;

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.checked, listItemId);
	};

	const toggle = <BitkitToggle {...rest} isChecked={isChecked} onChange={handleChange} />;

	if (tooltipLabel) {
		return (
			<Tooltip label={tooltipLabel}>
				<Box>{toggle}</Box>
			</Tooltip>
		);
	}

	return toggle;
};

export default Toggle;
