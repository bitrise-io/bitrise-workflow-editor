import { Fragment } from 'react';
import { Box, Divider, IconButton, Input, Text } from '@bitrise/bitkit';
import { useCopyToClipboard } from 'usehooks-ts';
import { FormControl } from '@chakra-ui/react';
import { StepOutputVariable } from '@/models';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import StepHelperText from '../components/StepHelperText';

type ItemProps = {
  item: StepOutputVariable;
};

const StepOutputVariableItem = ({ item }: ItemProps) => {
  const { key, title, description, summary } = item;
  const [, copy] = useCopyToClipboard();

  const handeCopy = () => copy(key);

  return (
    <Box display="flex" flexDirection="column" gap="8">
      <FormControl>
        <Input
          type="text"
          label={title}
          value={key}
          isReadOnly
          rightAddon={
            <IconButton variant="secondary" iconName="Duplicate" aria-label="Copy variable name" onClick={handeCopy} />
          }
          rightAddonPlacement="inside"
        />
        <StepHelperText summary={summary} details={description} />
      </FormControl>
    </Box>
  );
};

const OutputVariablesTab = () => {
  const { step } = useStepDrawerContext();

  return (
    <Box display="flex" flexDirection="column" gap="24">
      <Text>This step will generate these output variables:</Text>
      {step?.outputs?.map(({ opts, ...output }, index) => {
        const isLast = index === (step?.outputs?.length ?? 0) - 1;
        const [key] = Object.entries(output)[0];

        const item: StepOutputVariable = {
          key: `$${key}`,
          title: opts?.title,
          summary: opts?.summary,
          description: opts?.description,
        };

        return (
          <Fragment key={item.key}>
            <StepOutputVariableItem item={item} />
            {!isLast && <Divider />}
          </Fragment>
        );
      })}
    </Box>
  );
};

export default OutputVariablesTab;
