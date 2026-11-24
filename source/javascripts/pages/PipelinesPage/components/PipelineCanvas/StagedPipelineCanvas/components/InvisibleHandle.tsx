import { Handle, HandleProps, Position } from '@xyflow/react';
import { CSSProperties } from 'react';

type Props = HandleProps & { style?: CSSProperties };

const style: (props: Props) => CSSProperties = ({ style: externalStyle, position }) => ({
  background: 'transparent',
  border: '1px solid transparent',
  left: position === Position.Left ? 0 : undefined,
  right: position === Position.Right ? 0 : undefined,
  ...externalStyle,
});

const InvisibleHandle = (props: Props) => {
  return <Handle isConnectable={false} {...props} style={style(props)} />;
};

export default InvisibleHandle;
