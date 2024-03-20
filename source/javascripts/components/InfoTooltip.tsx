import { Icon, Tooltip } from "@bitrise/bitkit";

type InfoTooltipProps = {
  label: string;
};

const InfoTooltip = ({ label }: InfoTooltipProps) => {
  return (
    <Tooltip label={label}>
      <Icon name="Support" size="16" color="purple.10" />
    </Tooltip>
  );
};

export default InfoTooltip;
