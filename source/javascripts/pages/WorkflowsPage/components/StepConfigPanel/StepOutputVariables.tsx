import { Fragment } from 'react';
import { Box, Divider, IconButton, Input, Text } from '@bitrise/bitkit';
import { useCopyToClipboard } from 'usehooks-ts';
import { FormControl } from '@chakra-ui/react';
import StepHelperText from './components/StepHelperText';
import { StepOutputVariable } from '@/models';

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

type Props = {
  outputVariables: Array<StepOutputVariable>;
};

const StepOutputVariables = ({ outputVariables }: Props) => {
  return (
    <Box display="flex" flexDirection="column" p="24" gap="24">
      <Text>This step will generate these output variables:</Text>
      {outputVariables.map((item, index) => {
        const isLast = index === outputVariables.length - 1;
        return (
          <Fragment key={item.title}>
            <StepOutputVariableItem item={item} />
            {!isLast && <Divider />}
          </Fragment>
        );
      })}
    </Box>
  );
};

export default StepOutputVariables;
