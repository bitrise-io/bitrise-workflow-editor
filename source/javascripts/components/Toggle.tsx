import { Toggle as BitkitToggle, ToggleProps as BitkitToggleProps, Box, Tooltip } from "@bitrise/bitkit";

type ToggleProps = {
	tooltipLabel?: string;
	isCheckedGetterSetter(itemId?: any, isChecked?: boolean): boolean;
	// if toggle is used in a loop this can be used the identify what data is connected to this toggle
	listItemId: string;
} & Pick<BitkitToggleProps, "isDisabled">;

const Toggle = (props: ToggleProps) => {
	const { tooltipLabel, isCheckedGetterSetter, listItemId, ...rest } = props;

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		isCheckedGetterSetter(listItemId, event.target.checked);
	};

	const toggle = <BitkitToggle {...rest} isChecked={isCheckedGetterSetter(listItemId)} onChange={handleChange} />;

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
