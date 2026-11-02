import { BitkitIconButton, BitkitTextInput, IconCopy } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Separator } from '@chakra-ui/react/separator';
import { Text } from '@chakra-ui/react/text';
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
              <BitkitTextInput
                label={opts?.title || 'Output variable'}
                required={false}
                value={variable}
                state="readOnly"
                endAddon={
                  <BitkitIconButton
                    variant="secondary"
                    icon={IconCopy}
                    label="Copy variable name"
                    onClick={() => copy(variable)}
                  />
                }
              />
              <StepHelperText summary={opts?.summary} details={opts?.description} />
            </Box>
            {!isLast && <Separator />}
          </Fragment>
        );
      })}
    </Box>
  );
};

export default OutputVariablesTab;
