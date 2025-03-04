import { Fragment } from 'react';
import { Box, Button, Card, Divider, ExpandableCard, OverflowMenu, OverflowMenuItem, Text } from '@bitrise/bitkit';

import { useCopyToClipboard } from 'usehooks-ts';
import StepSelectInput from '@/components/unified-editor/StepConfigDrawer/components/StepSelectInput';
import StepInput from '@/components/unified-editor/StepConfigDrawer/components/StepInput';
import { expandInput } from '../utils/StepBundle.utils';
import { InputListItem } from '../types/StepBundle.types';

type Props = {
  category?: string;
  items: InputListItem[];
  onAdd: (category?: string) => void;
  onChange: (key: string, value: string) => void;
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
};

const StepBundleInputsCategoryCard = ({ category, items = [], onAdd, onChange, onDelete, onEdit }: Props) => {
  const [, copy] = useCopyToClipboard();

  if (items.length === 0) {
    return null;
  }

  const content = (
    <>
      {items?.map(({ index, input, instanceValue }) => {
        const { key, opts, value } = expandInput(input);
        const helper = { summary: opts?.summary, details: opts?.description };
        const isSelectInput = opts?.value_options && opts.value_options.length > 0;

        return (
          <Fragment key={key}>
            <Box display="flex" gap="12">
              {isSelectInput && (
                <StepSelectInput
                  helper={helper}
                  label={opts?.title || key}
                  value={instanceValue || value}
                  defaultValue={value}
                  isSensitive={opts?.is_sensitive}
                  options={opts?.value_options ?? []}
                  isDisabled={opts?.is_dont_change_value}
                  onChange={(changedValue) => onChange(key, changedValue)}
                />
              )}

              {!isSelectInput && (
                <StepInput
                  helper={helper}
                  label={opts?.title || key}
                  value={instanceValue || value}
                  defaultValue={value}
                  isRequired={opts?.is_required}
                  isSensitive={opts?.is_sensitive}
                  isDisabled={opts?.is_dont_change_value}
                  onChange={(changedValue) => onChange(key, changedValue)}
                  flex={1}
                />
              )}

              <OverflowMenu buttonProps={{ marginTop: '28', 'aria-label': 'More', iconName: 'MoreVertical' }}>
                <OverflowMenuItem leftIconName="Duplicate" onClick={() => copy(key)}>
                  Copy key
                </OverflowMenuItem>
                <OverflowMenuItem leftIconName="Pencil" onClick={() => onEdit(index)}>
                  Edit input
                </OverflowMenuItem>
                <Divider />
                <OverflowMenuItem leftIconName="Trash" isDanger onClick={() => onDelete(index)}>
                  Delete
                </OverflowMenuItem>
              </OverflowMenu>
            </Box>
            <Divider my="16" />
          </Fragment>
        );
      })}
      <Button leftIconName="Plus" variant="tertiary" size="md" onClick={() => onAdd(category)}>
        Add input
      </Button>
    </>
  );

  if (!category) {
    return (
      <Card variant="outline" p="16" mb="16">
        {content}
      </Card>
    );
  }

  return (
    <ExpandableCard mb={16} buttonContent={<Text textStyle="body/lg/semibold">{category}</Text>}>
      {content}
    </ExpandableCard>
  );
};

export default StepBundleInputsCategoryCard;
