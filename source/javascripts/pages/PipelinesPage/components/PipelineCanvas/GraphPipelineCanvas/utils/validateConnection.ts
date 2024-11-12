import { Edge, getOutgoers, IsValidConnection, Node } from '@xyflow/react';

// NOTE: https://reactflow.dev/examples/interaction/prevent-cycles
export default function validateConnection(nodes: Node[], edges: Edge[]): IsValidConnection {
  return (connection) => {
    const target = nodes.find((node) => node.id === connection.target);

    if (!target) {
      return false;
    }

    const hasCycle = (node: Node, visited = new Set()) => {
      if (visited.has(node.id)) {
        return false;
      }

      visited.add(node.id);

      // eslint-disable-next-line no-restricted-syntax
      for (const outgoer of getOutgoers(node, nodes, edges)) {
        if (outgoer.id === connection.source) return true;
        if (hasCycle(outgoer, visited)) return true;
      }
    };

    if (target.id === connection.source) {
      return false;
    }

    return !hasCycle(target);
  };
}
