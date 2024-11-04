import { CSSProperties } from 'react';
import { Handle, HandleProps, Position } from '@xyflow/react';

type Props = HandleProps & { style?: CSSProperties };

const style: (props: Props) => CSSProperties = ({ style: externalStyle, position }) => ({
  background: 'rgba(255, 255, 255, 0)',
  border: '1px solid rgba(255, 255, 255, 0)',
  left: position === Position.Left ? 0 : undefined,
  right: position === Position.Right ? 0 : undefined,
  ...externalStyle,
});

const InvisibleHandle = (props: Props) => {
  return <Handle isConnectable={false} {...props} style={style(props)} />;
};

export default InvisibleHandle;
