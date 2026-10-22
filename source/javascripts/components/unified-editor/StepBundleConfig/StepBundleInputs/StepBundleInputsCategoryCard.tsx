import { Card, ExpandableCard } from '@bitrise/bitkit';
import {
  BitkitActionMenu,
  BitkitButton,
  BitkitControlButton,
  IconCopy,
  IconMoreVertical,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Separator } from '@chakra-ui/react/separator';
import { Text } from '@chakra-ui/react/text';
import { Fragment } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import StepInput from '@/components/unified-editor/StepConfigDrawer/components/StepInput';
import StepSelectInput from '@/components/unified-editor/StepConfigDrawer/components/StepSelectInput';
import { useIsReadOnlyView } from '@/hooks/useTree';

import { InputListItem } from '../types/StepBundle.types';
import { expandInput } from '../utils/StepBundle.utils';

type Props = {
  category?: string;
  items: InputListItem[];
  onAdd: (category?: string) => void;
  onChange: (key: string, value: string, index: number) => void;
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
};

const StepBundleInputsCategoryCard = ({ category, items = [], onAdd, onChange, onDelete, onEdit }: Props) => {
  const isReadOnlyView = useIsReadOnlyView();
  const [, copy] = useCopyToClipboard();

  if (items.length === 0) {
    return null;
  }

  const content = (
    <>
      {items?.map(({ index, input, instanceValue }) => {
        const { key, opts, value: defaultValue } = expandInput(input);
        const helper = { summary: opts?.summary, details: opts?.description };
        const isSelectInput = opts?.value_options && opts.value_options.length > 0;

        return (
          <Fragment key={key}>
            <Box display="flex" gap="12">
              {isSelectInput && (
                <StepSelectInput
                  helper={helper}
                  label={opts?.title || key}
                  value={instanceValue || defaultValue}
                  defaultValue={instanceValue ? defaultValue : undefined}
                  isSensitive={opts?.is_sensitive}
                  options={opts?.value_options ?? []}
                  isDisabled={opts?.is_dont_change_value || isReadOnlyView}
                  onChange={(changedValue) => onChange(key, changedValue, index)}
                />
              )}

              {!isSelectInput && (
                <StepInput
                  helper={helper}
                  label={opts?.title || key}
                  value={instanceValue}
                  defaultValue={defaultValue}
                  isRequired={opts?.is_required}
                  isSensitive={opts?.is_sensitive}
                  isDisabled={opts?.is_dont_change_value || isReadOnlyView}
                  onChange={(changedValue) => onChange(key, changedValue, index)}
                  flex={1}
                  formLabelProps={{
                    optionalIndicator: (
                      <Text as="span" textStyle="body/md/regular" color="text/secondary" marginInlineStart="4">
                        (optional)
                      </Text>
                    ),
                    requiredIndicator: null,
                  }}
                />
              )}

              <BitkitActionMenu
                trigger={<BitkitControlButton icon={IconMoreVertical} label="More" marginBlockStart="24" size="md" />}
              >
                <BitkitActionMenu.Item icon={IconCopy} onClick={() => copy(key)}>
                  Copy key
                </BitkitActionMenu.Item>
                {/* Read-only (merged/ghost): no edit/delete CTAs — hidden, not disabled (BIVS-3721). */}
                {!isReadOnlyView && (
                  <>
                    <BitkitActionMenu.Item icon={IconPencil} onClick={() => onEdit(index)}>
                      Edit input
                    </BitkitActionMenu.Item>
                    <BitkitActionMenu.Separator />
                    <BitkitActionMenu.Item icon={IconTrash} isDanger onClick={() => onDelete(index)}>
                      Delete
                    </BitkitActionMenu.Item>
                  </>
                )}
              </BitkitActionMenu>
            </Box>
            <Separator marginBlock="16" />
          </Fragment>
        );
      })}
      {!isReadOnlyView && (
        <BitkitButton icon={IconPlus} variant="tertiary" size="md" onClick={() => onAdd(category)}>
          Add input
        </BitkitButton>
      )}
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
