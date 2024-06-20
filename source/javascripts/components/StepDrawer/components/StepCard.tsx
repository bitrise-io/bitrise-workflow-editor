import { Box, Card, Icon, Text } from '@bitrise/bitkit';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useBoolean } from 'usehooks-ts';
import { Step } from '../StepDrawer.types';
import defaultStepIcon from '../../../../images/step/icon-default.svg';
import StepBadge from '../../StepBadge/StepBadge';

type Props = Step;

const StepCard = ({ icon, title, description, version, isOfficial, isVerified, isDeprecated }: Props) => {
  const { value: hovered, setTrue, setFalse } = useBoolean(false);

  return (
    <Card
      variant="outline"
      position="relative"
      minW="256px"
      padding="12"
      onMouseEnter={setTrue}
      onMouseLeave={setFalse}
    >
      <Box display="flex" gap="8">
        <Box position="relative">
          <LazyLoadImage
            effect="blur"
            src={icon || defaultStepIcon}
            style={{
              height: '40px',
              borderRadius: '4px',
              border: '1px solid var(--colors-neutral-90)',
            }}
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
        <Box>
          <Text textStyle="body/lg/semibold">{title}</Text>
          <Text textStyle="body/md/regular" color="text/secondary">
            {version}
          </Text>
        </Box>
      </Box>
      <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
        {description}
      </Text>
      {hovered && <Icon position="absolute" top={12} right={12} name="PlusAdd" color="icon/interactive" />}
    </Card>
  );
};

export default StepCard;
