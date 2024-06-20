import { Box, Card, Icon, Image, Text } from '@bitrise/bitkit';

import defaultStepIcon from '../../../../images/step/icon-default.svg';
import StepBadge from '../../StepBadge/StepBadge';
import { Step } from '../StepDrawer.types';

type Props = Step;

const StepGridCard = ({ icon, title, description, version, isOfficial, isVerified, isDeprecated }: Props) => {
  return (
    <Card variant="outline" position="relative" minW="256px" padding="12" className="group">
      <Box display="flex" gap="8">
        <Box position="relative" minW="40px" minH="40px">
          <Image
            height="40px"
            width="40px"
            src={icon}
            alt={title}
            fallbackSrc={defaultStepIcon}
            borderRadius="4px"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="neutral.90"
            loading="lazy"
          />
          <StepBadge
            position="absolute"
            top="21px"
            left="21px"
            isOfficial={isOfficial}
            isVerified={isVerified}
            isDeprecated={isDeprecated}
          />
        </Box>
        <Box w="100%">
          <Text textStyle="body/lg/semibold" hasEllipsis marginRight="32">
            {title}
          </Text>
          <Text textStyle="body/md/regular" color="text/secondary">
            {version}
          </Text>
        </Box>
      </Box>
      <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
        {description}
      </Text>
      <Icon
        position="absolute"
        top={12}
        right={12}
        name="PlusAdd"
        color="icon/interactive"
        display="none"
        _groupHover={{ display: 'block' }}
      />
    </Card>
  );
};

export default StepGridCard;
