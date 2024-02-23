import { Divider } from "@bitrise/bitkit";
import { Fragment } from "react";

import { Variable } from "../../../models";
import StepInputComponent from "./StepInput";

type Props = {
	inputs: Variable[];
	onClickInsertVariable: (input: Variable) => void;
};

const StepInputList = ({ inputs, onClickInsertVariable }: Props) => {
	return (
		<>
			{inputs.map((input, index) => {
				return (
					<Fragment key={input.title()}>
						{index > 0 && <Divider my={24} />}
						<StepInputComponent input={input} onClickInsertVariable={onClickInsertVariable} />
					</Fragment>
				);
			})}
		</>
	);
};

export default StepInputList;
