import { Edge, Node } from 'reactflow';

const usePipelineStageEdges = (nodes: Node[]): Edge[] => {
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
      updatable: false,
      interactionWidth: 0,
      style: { strokeWidth: 2, stroke: 'var(--colors-border-regular)', cursor: 'grab' },
    });
  }

  return edges;
};

export default usePipelineStageEdges;
