import { Fragment } from 'react';
import { Box, Divider, IconButton, Input, Text } from '@bitrise/bitkit';
import { useCopyToClipboard } from 'usehooks-ts';
import { FormControl } from '@chakra-ui/react';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import StepHelperText from '../components/StepHelperText';

const OutputVariablesTab = () => {
  const [, copy] = useCopyToClipboard();
  const { data, isLoading } = useStepDrawerContext();
  const { mergedValues } = data ?? {};

  // TODO loading state
  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <Box display="flex" flexDirection="column" gap="24">
      <Text>This step will generate these output variables:</Text>
      {mergedValues?.outputs?.map(({ opts, ...output }, index) => {
        const isLast = index === (mergedValues?.outputs?.length ?? 0) - 1;
        const [key] = Object.entries(output)[0];

        return (
          <Fragment key={key}>
            <Box display="flex" flexDirection="column" gap="8">
              <FormControl>
                <Input
                  type="text"
                  label={opts?.title || 'Output variable'}
                  value={key}
                  isReadOnly
                  rightAddon={
                    <IconButton
                      variant="secondary"
                      iconName="Duplicate"
                      aria-label="Copy variable name"
                      onClick={() => copy(key)}
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
