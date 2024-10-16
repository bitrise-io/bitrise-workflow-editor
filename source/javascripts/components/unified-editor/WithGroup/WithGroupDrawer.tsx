import { Icon, useDisclosure } from '@bitrise/bitkit';
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  UseDisclosureProps,
} from '@chakra-ui/react';
import useStep from '@/hooks/useStep';
import StepService from '@/core/models/StepService';
import { WithGroup } from '@/core/models/Step';
import { WithBlockContent, WithBlockHeader } from './WithGroupPanel';

type Props = UseDisclosureProps & {
  workflowId: string;
  stepIndex: number;
};

const WithGroupDrawer = ({ workflowId, stepIndex, ...disclosureProps }: Props) => {
  const { isOpen, onClose } = useDisclosure(disclosureProps);
  const { data } = useStep(workflowId, stepIndex);
  const isWithGroup = StepService.isWithGroup(data?.cvs || '', data?.userValues);

  if (!isWithGroup || !data) {
    return null;
  }

  const {
    title,
    userValues: { container = '', services = [] },
  } = data as WithGroup;

  return (
    <Drawer isFullHeight isOpen={isOpen} onClose={onClose} autoFocus={false}>
      <DrawerOverlay
        top={0}
        bg="linear-gradient(to left, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%);"
      />
      <DrawerContent
        top={0}
        gap="0"
        padding={0}
        display="flex"
        flexDir="column"
        margin={[0, 24]}
        overflow="hidden"
        boxShadow="large"
        borderRadius={[0, 12]}
        maxWidth={['100%', '50%']}
      >
        <DrawerCloseButton size="md">
          <Icon name="Cross" />
        </DrawerCloseButton>

        <DrawerHeader color="initial" textTransform="initial" fontWeight="initial">
          <WithBlockHeader title={title} />
        </DrawerHeader>

        <WithBlockContent imageName={container} services={services} />
      </DrawerContent>
    </Drawer>
  );
};

export default WithGroupDrawer;
