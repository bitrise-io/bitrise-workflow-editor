import { GENERATED_WORKFLOWS_PLACEHOLDER_NODE_TYPE, WORKFLOW_NODE_TYPE } from '../GraphPipelineCanvas.const';
import { PipelineCanvasWorkflow } from '../GraphPipelineCanvas.types';
import { generatedWorkflowsPlaceholderNodeId } from './createGeneratedWorkflowsPlaceholderNode';
import transformWorkflowsToGraphEntities from './transformWorkflowsToGraphEntities';

const workflow = (overrides: Partial<PipelineCanvasWorkflow>): PipelineCanvasWorkflow => ({
  id: 'wf',
  dependsOn: [],
  isGenerator: false,
  ...overrides,
});

describe('transformWorkflowsToGraphEntities', () => {
  it('emits a single workflow node and no placeholders for a non-generator workflow', () => {
    const { nodes, edges } = transformWorkflowsToGraphEntities([workflow({ id: 'wf1' })]);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe(WORKFLOW_NODE_TYPE);
    expect(edges).toHaveLength(0);
  });

  it('emits a placeholder node and edge for a generator workflow with no dependants', () => {
    const { nodes, edges } = transformWorkflowsToGraphEntities([workflow({ id: 'gen', isGenerator: true })]);

    expect(nodes).toHaveLength(2);
    expect(nodes[0].type).toBe(WORKFLOW_NODE_TYPE);
    expect(nodes[1].type).toBe(GENERATED_WORKFLOWS_PLACEHOLDER_NODE_TYPE);

    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe('gen');
    expect(edges[0].target).toBe(generatedWorkflowsPlaceholderNodeId('gen'));
    expect(edges[0].animated).toBe(true);
    expect(edges[0].deletable).toBe(false);
    expect(edges[0].selectable).toBe(false);
    expect(edges[0].reconnectable).toBe(false);
  });

  it('emits the placeholder even when other static workflows already depend on the generator', () => {
    const { nodes, edges } = transformWorkflowsToGraphEntities([
      workflow({ id: 'gen', isGenerator: true }),
      workflow({ id: 'tests', dependsOn: ['gen'] }),
    ]);

    const placeholderNodes = nodes.filter((n) => n.type === GENERATED_WORKFLOWS_PLACEHOLDER_NODE_TYPE);
    const placeholderEdges = edges.filter((e) => e.target === generatedWorkflowsPlaceholderNodeId('gen'));

    expect(placeholderNodes).toHaveLength(1);
    expect(placeholderEdges).toHaveLength(1);
    expect(edges.some((e) => e.source === 'gen' && e.target === 'tests')).toBe(true);
  });

  it('produces a deterministic placeholder id derived from the generator workflow id', () => {
    const { nodes: nodesA } = transformWorkflowsToGraphEntities([workflow({ id: 'gen', isGenerator: true })]);
    const { nodes: nodesB } = transformWorkflowsToGraphEntities([workflow({ id: 'gen', isGenerator: true })]);

    expect(nodesA[1].id).toBe(generatedWorkflowsPlaceholderNodeId('gen'));
    expect(nodesA[1].id).toBe(nodesB[1].id);
  });

  it('marks the placeholder node as not connectable / selectable / deletable', () => {
    const { nodes } = transformWorkflowsToGraphEntities([workflow({ id: 'gen', isGenerator: true })]);
    const placeholder = nodes.find((n) => n.type === GENERATED_WORKFLOWS_PLACEHOLDER_NODE_TYPE);

    expect(placeholder).toBeDefined();
    expect(placeholder?.connectable).toBe(false);
    expect(placeholder?.selectable).toBe(false);
    expect(placeholder?.deletable).toBe(false);
  });
});
