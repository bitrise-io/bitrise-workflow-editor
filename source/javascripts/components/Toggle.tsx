import { Toggle as BitkitToggle, ToggleProps as BitkitToggleProps, Box, Tooltip } from "@bitrise/bitkit";

type ToggleProps = {
	tooltipLabel?: string;
	isCheckedGetterSetter(isChecked?: boolean): boolean;
} & Pick<BitkitToggleProps, "isDisabled">;

const Toggle = (props: ToggleProps) => {
	const { tooltipLabel, isCheckedGetterSetter, ...rest } = props;

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		isCheckedGetterSetter(event.target.checked);
	};

	if (tooltipLabel) {
		return (
			<Tooltip label={tooltipLabel}>
				<Box>
					<BitkitToggle {...rest} isChecked={isCheckedGetterSetter()} onChange={handleChange} />
				</Box>
			</Tooltip>
		);
	}

	return <BitkitToggle {...rest} onChange={handleChange} />;
};

export default Toggle;
