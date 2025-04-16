import { Box, Divider, IconButton, Input, Text } from '@bitrise/bitkit';
import { FormControl } from '@chakra-ui/react';
import { Fragment } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import StepHelperText from '../components/StepHelperText';
import { useStepDrawerContext } from '../StepConfigDrawer.context';

const OutputVariablesTab = () => {
  const [, copy] = useCopyToClipboard();
  const { data } = useStepDrawerContext();
  const { mergedValues } = data ?? {};

  return (
    <Box display="flex" flexDirection="column" gap="24">
      <Text>This step will generate these output variables:</Text>
      {mergedValues?.outputs?.map(({ opts, ...output }, index) => {
        const isLast = index === (mergedValues?.outputs?.length ?? 0) - 1;
        const [key] = Object.entries(output)[0];
        const variable = `$${key}`;

        return (
          <Fragment key={key}>
            <Box display="flex" flexDirection="column" gap="8">
              <FormControl>
                <Input
                  type="text"
                  label={opts?.title || 'Output variable'}
                  value={variable}
                  isReadOnly
                  rightAddon={
                    <IconButton
                      variant="secondary"
                      iconName="Duplicate"
                      aria-label="Copy variable name"
                      tooltipProps={{ 'aria-label': 'Copy variable name' }}
                      onClick={() => copy(variable)}
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

export default OutputVariablesTab;
