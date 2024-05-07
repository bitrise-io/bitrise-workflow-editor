import { Fragment, useState } from 'react';
import { Box, Collapse, Divider, IconButton, Input, Link, MarkdownContent, Text } from '@bitrise/bitkit';
import { useCopyToClipboard } from 'usehooks-ts';

import { StepOutputVariable } from '../models';

type ItemProps = {
  item: StepOutputVariable;
};

const StepOutputVariableItem = ({ item }: ItemProps) => {
  const { key, title, description, summary } = item;
  const [showMore, setShowMore] = useState(false);
  const [, copy] = useCopyToClipboard();

  const handeCopy = () => copy(key);

  return (
    <Box display="flex" flexDirection="column" gap="8">
      <Input
        type="text"
        label={title}
        value={key}
        helperText={summary}
        isReadOnly
        isRequired
        rightAddon={
          <IconButton variant="secondary" iconName="Duplicate" aria-label="Copy variable name" onClick={handeCopy} />
        }
        rightAddonPlacement="inside"
      />
      {description && (
        <>
          <Collapse in={showMore} transition={{ enter: { duration: 0.2 }, exit: { duration: 0.2 } }}>
            <MarkdownContent md={description || ''} />
          </Collapse>
          <Link as="button" colorScheme="purple" alignSelf="self-start" onClick={() => setShowMore((prev) => !prev)}>
            {showMore ? 'Show less' : 'Show more'}
          </Link>
        </>
      )}
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
