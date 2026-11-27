import { useToken } from '@chakra-ui/react/styled-system';
import { Edge, Node } from '@xyflow/react';

const usePipelineStageEdges = (nodes: Node[]): Edge[] => {
  const [stroke] = useToken('colors', ['border/regular']);
  const edges: Edge[] = [];

  for (let i = 1; i < nodes.length; i++) {
    const target = nodes[i].id;
    const source = nodes[i - 1].id;

    edges.push({
      id: `${source}->${target}`,
      source,
      target,
      animated: false,
      deletable: false,
      focusable: false,
      interactionWidth: 0,
      style: { strokeWidth: 2, stroke, cursor: 'grab' },
    });
  }

  return edges;
};

export default usePipelineStageEdges;
