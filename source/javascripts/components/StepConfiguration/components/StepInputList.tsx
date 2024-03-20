import { Fragment } from "react";
import { Divider } from "@bitrise/bitkit";
import { useFormContext } from "react-hook-form";

import { Variable } from "../../../models";
import StepInputComponent from "./StepInput/StepInput";

type Props = {
  inputs: Variable[];
};

const StepInputList = ({ inputs }: Props) => {
  const { register } = useFormContext();

  return (
    <>
      {inputs.map((input, index) => {
        return (
          <Fragment key={input.key()}>
            {index > 0 && <Divider my={24} />}
            <StepInputComponent
              {...register(input.key())}
              label={input.title()}
              defaultValue={input.value()}
              options={input.valueOptions()}
              helperSummary={input.summary()}
              helperDetails={input.description()}
              isRequired={input.isRequired()}
              isSensitive={input.isSensitive()}
              isReadOnly={input.isDontChangeValue()}
            />
          </Fragment>
        );
      })}
    </>
  );
};

export default StepInputList;
