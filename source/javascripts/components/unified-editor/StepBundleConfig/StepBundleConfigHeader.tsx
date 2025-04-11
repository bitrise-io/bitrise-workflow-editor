import { Box, Tab, TabList, Text } from '@bitrise/bitkit';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/services/StepBundleService';
import { useStepBundleConfigContext } from './StepBundleConfig.context';

type HeaderProps = {
  variant: 'panel' | 'drawer';
};

const StepBundleConfigHeader = (props: HeaderProps) => {
  const { variant } = props;
  const { stepBundle } = useStepBundleConfigContext() ?? {};
  const { cvs, id, userValues } = stepBundle ?? {};
  const dependants = useDependantWorkflows({ stepBundleCvs: cvs });

  return (
    <>
      <Box p={variant === 'panel' ? '16px 24px 0px 24px' : '0'}>
        <Text as="h3" textStyle="heading/h3">
          {userValues?.title || id || 'Step bundle'}
        </Text>
        <Text textStyle="body/sm/regular" color="text/secondary">
          {StepBundleService.getUsedByText(dependants.length)}
        </Text>
      </Box>
      <TabList paddingX="8" mx={variant === 'drawer' ? '-24' : '0'} mt="16">
        <Tab>Configuration</Tab>
        <Tab>Properties</Tab>
      </TabList>
    </>
  );
};

export default StepBundleConfigHeader;
