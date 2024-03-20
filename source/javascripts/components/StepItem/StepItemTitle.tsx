import { Text, TextProps } from '@bitrise/bitkit';

type StepItemTitleProps = {
  displayName: string;
} & TextProps;

const StepItemTitle = ({ displayName, ...rest }: StepItemTitleProps): JSX.Element => (
  <Text data-e2e-tag="step-item__title" className="title" hasEllipsis {...rest}>
    {displayName}
  </Text>
);

export default StepItemTitle;
