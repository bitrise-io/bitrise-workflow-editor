import { Box, Card, Divider, ExpandableCard, OverflowMenu, OverflowMenuItem, Text } from '@bitrise/bitkit';

import { useCopyToClipboard } from 'usehooks-ts';
import StepSelectInput from '@/components/unified-editor/StepConfigDrawer/components/StepSelectInput';
import StepInput from '@/components/unified-editor/StepConfigDrawer/components/StepInput';
import { InputListItem } from '@/components/unified-editor/StepBundlesConfig/StepBundle.types';

type Props = {
  title?: string;
  defaults: InputListItem[];
  onChange?: (index: number, value: string | null) => void;
  onDelete?: (index: number) => void;
  onEdit?: (index: number) => void;
};

const StepInputGroup = ({ title, defaults = [], onChange, onDelete, onEdit }: Props) => {
  const [, copy] = useCopyToClipboard();

  const content = (
    <>
      {defaults?.map(({ index, opts, ...defaultInput }, i) => {
        const helper = { summary: opts?.summary, details: opts?.description };
        const isSelectInput = opts?.value_options && opts.value_options.length > 0;
        const key = Object.keys(defaultInput)[0];
        const value = Object.values(defaultInput)[0] as string | null;
        return (
          <Box key={key} display="flex" width="100%" gap={12}>
            {i > 0 && <Divider my={24} />}

            {isSelectInput && (
              <StepSelectInput
                helper={helper}
                label={opts?.title}
                value={value}
                // defaultValue={defaultValue}
                isSensitive={opts?.is_sensitive}
                options={opts?.value_options ?? []}
                isDisabled={opts?.is_dont_change_value}
                onChange={(changedValue) => onChange?.(index, changedValue)}
              />
            )}

            {!isSelectInput && (
              <StepInput
                helper={helper}
                label={opts?.title}
                value={value || ''}
                // defaultValue={defaultValue}
                isRequired={opts?.is_required}
                isSensitive={opts?.is_sensitive}
                isDisabled={opts?.is_dont_change_value}
                onChange={(changedValue) => onChange?.(index, changedValue)}
                flex={1}
              />
            )}

            <OverflowMenu buttonProps={{ marginTop: 28, 'aria-label': 'More', iconName: 'MoreVertical' }}>
              <OverflowMenuItem leftIconName="Duplicate" onClick={() => copy(key)}>
                Copy key
              </OverflowMenuItem>
              <OverflowMenuItem leftIconName="Pencil" onClick={() => onEdit?.(index)}>
                Edit input
              </OverflowMenuItem>
              <Divider />
              <OverflowMenuItem leftIconName="Trash" isDanger onClick={() => onDelete?.(index)}>
                Delete
              </OverflowMenuItem>
            </OverflowMenu>
          </Box>
        );
      })}
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

export default StepInputGroup;
