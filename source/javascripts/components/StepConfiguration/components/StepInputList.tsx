import { Divider } from "@bitrise/bitkit";
import { FocusEvent, Fragment } from "react";

import { Variable } from "../../../models";
import StepInputComponent from "./StepInput";

type Props = {
	inputs: Variable[];
	onBlur: (e: FocusEvent, input: Variable) => void;
	onClickInsertSecret: (input: Variable) => void;
	onClickInsertVariable: (input: Variable) => void;
};

const StepInputList = ({ inputs, onBlur, onClickInsertSecret, onClickInsertVariable }: Props) => {
	return (
		<>
			{inputs.map((input, index) => {
				return (
					<Fragment key={input.title()}>
						{index > 0 && <Divider my={24} />}
						<StepInputComponent
							input={input}
							onBlur={onBlur}
							onClickInsertSecret={onClickInsertSecret}
							onClickInsertVariable={onClickInsertVariable}
						/>
					</Fragment>
				);
			})}
		</>
	);
};

export default StepInputList;
