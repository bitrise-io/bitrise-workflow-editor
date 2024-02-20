import { Divider } from "@bitrise/bitkit";
import { Fragment } from "react";

import { StepInput } from "../../../models";
import { createKey, extractInputNameAndDefaultValue } from "../utils";
import StepInputComponent from "./StepInput";

type Props = {
	inputs: StepInput[];
};

const StepInputList = ({ inputs }: Props) => {
	return (
		<>
			{inputs.map(({ opts, ...rest }, index) => {
				const { name, defaultValue } = extractInputNameAndDefaultValue(rest);

				return (
					<Fragment key={createKey(opts.title)}>
						{index > 0 && <Divider my={24} />}
						<StepInputComponent
							name={name}
							label={opts.title}
							defaultValue={defaultValue}
							isRequired={opts.is_required}
							isSensitive={opts.is_sensitive}
							isReadOnly={opts.is_dont_change_value}
						/>
					</Fragment>
				);
			})}
		</>
	);
};

export default StepInputList;
