import { Fragment } from 'react';
import { Box, Divider, IconButton, Input, Text } from '@bitrise/bitkit';
import { FormControl } from '@chakra-ui/react';
import { useCopyToClipboard } from 'usehooks-ts';
import { StepOutputVariable } from '@/core/models/Step';
import StepHelperText from './components/StepHelperText';

type Props = {
  outputVariables: Array<StepOutputVariable>;
};

const StepOutputVariables = ({ outputVariables }: Props) => {
  const [, copy] = useCopyToClipboard();

  return (
    <Box display="flex" flexDirection="column" p="24" gap="24">
      <Text>This step will generate these output variables:</Text>
      {outputVariables.map(({ key, opts }, index) => {
        const isLast = index === outputVariables.length - 1;
        return (
          <Fragment key={key as string}>
            <Box display="flex" flexDirection="column" gap="8">
              <FormControl>
                <Input
                  type="text"
                  label={opts?.title || 'Output variable'}
                  value={key as string}
                  isReadOnly
                  rightAddon={
                    <IconButton
                      variant="secondary"
                      iconName="Duplicate"
                      aria-label="Copy variable name"
                      onClick={() => copy(key as string)}
                    />
                  }
                  rightAddonPlacement="inside"
                />
                <StepHelperText summary={opts?.summary} details={opts?.description} />
              </FormControl>
            </Box>
            {!isLast && <Divider />}
          </Fragment>
        );
      })}
    </Box>
  );
};

export default StepOutputVariables;
