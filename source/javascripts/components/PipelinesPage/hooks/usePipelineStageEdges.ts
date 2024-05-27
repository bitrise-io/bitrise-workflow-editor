import { Edge, Node } from 'reactflow';

function* edgeGenerator(nodes: Node[]): Iterable<Edge> {
  for (let i = 1; i < nodes.length; i++) {
    const target = nodes[i].id;
    const source = nodes[i - 1].id;

    yield {
      id: `${source}->${target}`,
      source,
      target,
      animated: false,
      deletable: false,
      focusable: false,
      updatable: false,
      interactionWidth: 0,
      style: { strokeWidth: 2, stroke: 'var(--colors-border-regular)', cursor: 'grab' },
    };
  }
}

const usePipelineStageEdges = (nodes: Node[]): Edge[] => {
  return Array.from(edgeGenerator(nodes));
};

export default usePipelineStageEdges;
