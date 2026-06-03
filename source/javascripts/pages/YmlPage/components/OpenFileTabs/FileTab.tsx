import { BitkitIconButton, BitkitTag, IconCross, IconLock } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';

import TreeService from '@/core/services/TreeService';
import { useFile, useFileIsDirty } from '@/hooks/useFile';
import { useTabs } from '@/hooks/useTabs';

type Props = {
  nodeId: string;
  isPreview: boolean;
  isActive: boolean;
};

const FileTab = ({ nodeId, isPreview, isActive }: Props) => {
  const { selectTab, closeTab } = useTabs();
  const file = useFile(nodeId);
  const isDirty = useFileIsDirty(nodeId);

  if (!file) {
    return null;
  }

  const name = TreeService.fileName(file.path);
  const refLabel = TreeService.sourceLabel(file.source);

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="6"
      flexShrink={0}
      paddingInline="12"
      height="40px"
      cursor="pointer"
      borderRightWidth="1px"
      borderRightColor="border/minimal"
      borderBottomWidth="2px"
      borderBottomColor={isActive ? 'border/selected' : 'transparent'}
      backgroundColor={isActive ? 'background/selected' : 'transparent'}
      _hover={{ backgroundColor: isActive ? 'background/selected' : 'background/hover' }}
      onClick={() => selectTab(nodeId)}
      role="tab"
      aria-selected={isActive}
    >
      {!file.editable && <IconLock size="16" />}
      <Text
        textStyle="body/md/regular"
        color="text/primary"
        fontStyle={isPreview ? 'italic' : undefined}
        whiteSpace="nowrap"
      >
        {name}
      </Text>
      {refLabel && <BitkitTag labelText={refLabel} />}
      {isDirty && <Box width="6px" height="6px" borderRadius="full" backgroundColor="text/secondary" />}
      <BitkitIconButton
        icon={IconCross}
        label={`Close ${name}`}
        size="sm"
        variant="tertiary"
        onClick={(event) => {
          event.stopPropagation();
          closeTab(nodeId);
        }}
      />
    </Box>
  );
};

export default FileTab;
