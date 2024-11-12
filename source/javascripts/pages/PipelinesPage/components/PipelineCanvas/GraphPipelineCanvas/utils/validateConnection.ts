import { IsValidConnection, Node } from '@xyflow/react';

export default function validateConnection(_nodes: Node[]): IsValidConnection {
  return () => {
    // TODO: Implement cycle detection here
    return true;
  };
}
