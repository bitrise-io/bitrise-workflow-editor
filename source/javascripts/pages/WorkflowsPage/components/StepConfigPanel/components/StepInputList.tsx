import { Fragment } from 'react';
import { Divider } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';

import { Variable } from '@/models';
import StepInputComponent from './StepInput/StepInput';

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
              {...register(input.key(), {
                required: {
                  value: input.isRequired(),
                  message: 'This field is required',
                },
              })}
              label={input.title()}
              options={input.valueOptions()}
              helperSummary={input.summary()}
              helperDetails={input.description()}
              isRequired={input.isRequired()}
              isSensitive={input.isSensitive()}
              isDisabled={input.isDontChangeValue()}
            />
          </Fragment>
        );
      })}
    </>
  );
};

export default StepInputList;
