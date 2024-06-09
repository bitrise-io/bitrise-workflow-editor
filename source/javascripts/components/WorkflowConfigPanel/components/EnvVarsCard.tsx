import { ExpandableCard, Text } from '@bitrise/bitkit';

const ButtonContent = () => {
  return <Text textStyle="body/lg/semibold">EnvVars</Text>;
};

const EnvVarsCard = () => {
  return <ExpandableCard buttonContent={<ButtonContent />}>EnvVarsCard</ExpandableCard>;
};

export default EnvVarsCard;
