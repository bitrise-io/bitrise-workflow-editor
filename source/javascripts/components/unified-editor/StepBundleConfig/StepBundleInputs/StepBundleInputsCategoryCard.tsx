import { Fragment } from 'react';
import { Box, Button, Card, Divider, ExpandableCard, OverflowMenu, OverflowMenuItem, Text } from '@bitrise/bitkit';

import { useCopyToClipboard } from 'usehooks-ts';
import StepSelectInput from '@/components/unified-editor/StepConfigDrawer/components/StepSelectInput';
import StepInput from '@/components/unified-editor/StepConfigDrawer/components/StepInput';
import { InputListItem } from '../types/StepBundle.types';

type Props = {
  defaults: InputListItem[];
  onAdd: VoidFunction;
  onChange: (key: string, value: string) => void;
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
  title?: string;
};

const StepBundleInputsCategoryCard = ({ defaults = [], onAdd, onChange, onDelete, onEdit, title }: Props) => {
  const [, copy] = useCopyToClipboard();

  if (defaults.length === 0) {
    return null;
  }

  const content = (
    <>
      {defaults?.map(({ index, opts, ...defaultInput }) => {
        const helper = { summary: opts?.summary, details: opts?.description };
        const isSelectInput = opts?.value_options && opts.value_options.length > 0;
        const key = Object.keys(defaultInput)[0];
        const value = (Object.values(defaultInput)[0] as string | null) || '';

        return (
          <Fragment key={key}>
            <Box display="flex" gap="12">
              {isSelectInput && (
                <StepSelectInput
                  helper={helper}
                  label={opts?.title || key}
                  value={value}
                  // defaultValue={defaultValue}
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
                  value={value || ''}
                  // defaultValue={defaultValue}
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
      <Button leftIconName="Plus" variant="tertiary" size="md" onClick={onAdd}>
        Add input
      </Button>
    </>
  );

  if (!title) {
    return (
      <Card variant="outline" p="16" mb="16">
        {content}
      </Card>
    );
  }

  return (
    <ExpandableCard mb={16} buttonContent={<Text textStyle="body/lg/semibold">{title}</Text>}>
      {content}
    </ExpandableCard>
  );
};

export default StepBundleInputsCategoryCard;
