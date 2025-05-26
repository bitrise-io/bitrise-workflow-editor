import { parseDocument, Scalar, stringify, YAMLMap, YAMLSeq } from 'yaml';

import BitriseYmlApi from '../api/BitriseYmlApi';
import { YamlMutatorCtx } from '../stores/BitriseYmlStore';
import YamlUtils from './YamlUtils';
import YamlExample from './YamlUtils.yaml';

const orinalYamlDocument = parseDocument(YamlExample);

const asArr = (path: string) => path.split('.');
const asYaml = (node: unknown) => stringify(node);
// const asJson = (node: unknown) => (node as Node)?.toJSON();

describe('YamlUtils', () => {
  let ctx: YamlMutatorCtx;

  beforeEach(() => {
    ctx = {
      doc: orinalYamlDocument.clone(),
      paths: YamlUtils.collectPaths(orinalYamlDocument.toJSON()),
    };
  });

  describe('updateKey', () => {
    it('should update a key in the document', () => {
      YamlUtils.updateKey(ctx, 'root', 'new_key');
      expect(ctx.doc.hasIn(asArr('root'))).toBe(false);
      expect(ctx.doc.getIn(asArr('new_key'))).toBe('root value');
      expect(Object.keys(ctx.doc.toJSON())[0]).toBe('new_key');
    });

    it('should update a key in the document with a glob', () => {
      YamlUtils.updateKey(ctx, 'complex_mapping.country.states.*.name', 'new_key');
      expect(ctx.doc.getIn(asArr('complex_mapping.country.states.0.new_key'))).toBe('California');
      expect(ctx.doc.getIn(asArr('complex_mapping.country.states.1.new_key'))).toBe('Texas');
    });

    it('should update a deeply nested key in the document with a glob', () => {
      YamlUtils.updateKey(ctx, 'string_examples.plain_string', 'new_key');
      expect(ctx.doc.hasIn(asArr('string_examples.new_key'))).toBe(true);
      expect(ctx.doc.hasIn(asArr('string_examples.plain_string'))).toBe(false);
    });

    it('should update a deeply nested key when the key is not a leaf key', () => {
      YamlUtils.updateKey(ctx, 'mapping_example.nested_mapping', 'new_key');
      expect(ctx.doc.hasIn(asArr('mapping_example.new_key'))).toBe(true);
      expect(ctx.doc.hasIn(asArr('mapping_example.nested_mapping'))).toBe(false);
    });

    it('should not update when the path is not found', () => {
      YamlUtils.updateKey(ctx, 'nonexistent', 'new_key');
      expect(ctx.doc.hasIn(asArr('nonexistent'))).toBe(false);
    });
  });

  describe('updateValue', () => {
    it('should update a value in the document', () => {
      YamlUtils.updateValue(ctx, 'root', 'new value');
      expect(ctx.doc.getIn(asArr('root'))).toBe('new value');
      expect(ctx.doc.getIn(asArr('root'), true)).toBeInstanceOf(Scalar);
    });

    it('should update a value in the document with a glob', () => {
      YamlUtils.updateValue(ctx, 'complex_mapping.country.states.*.name', 'new value');
      expect(ctx.doc.getIn(asArr('complex_mapping.country.states.0.name'))).toBe('new value');
      expect(ctx.doc.getIn(asArr('complex_mapping.country.states.1.name'))).toBe('new value');
    });

    it('should update a value in the document with a glob and a condition', () => {
      YamlUtils.updateValue(ctx, 'complex_mapping.country.states.*.name', 'new value', 'Texas');
      expect(ctx.doc.getIn(asArr('complex_mapping.country.states.0.name'))).toBe('California');
      expect(ctx.doc.getIn(asArr('complex_mapping.country.states.1.name'))).toBe('new value');
    });

    it('should update a null value with the new value as a scalar', () => {
      YamlUtils.updateValue(ctx, 'scalars.null_value', 'new value');
      expect(ctx.doc.getIn(asArr('scalars.null_value'))).toBe('new value');
      expect(ctx.doc.getIn(asArr('scalars.null_value'), true)).toBeInstanceOf(Scalar);
    });

    it('should not update when the path is not found', () => {
      YamlUtils.updateValue(ctx, 'nonexistent', 'new value');
      expect(ctx.doc.hasIn(asArr('nonexistent'))).toBe(false);
    });
  });

  describe('deleteNodeByPath', () => {
    it('should delete a node in the document', () => {
      YamlUtils.deleteNodeByPath(ctx, 'root');
      expect(ctx.doc.hasIn(asArr('root'))).toBe(false);
      expect(ctx.doc.getIn(asArr('root'))).toBeUndefined();
    });

    it('should delete a node in the document with a glob', () => {
      YamlUtils.deleteNodeByPath(ctx, 'complex_mapping.country.states.*.name');
      expect(ctx.doc.hasIn(asArr('complex_mapping.country.states.0.name'))).toBe(false);
      expect(ctx.doc.hasIn(asArr('complex_mapping.country.states.1.name'))).toBe(false);
      expect(ctx.doc.hasIn(asArr('complex_mapping.country.states.0.capital'))).toBe(true);
      expect(ctx.doc.hasIn(asArr('complex_mapping.country.states.1.capital'))).toBe(true);
    });

    it('should not delete when the path is not found', () => {
      YamlUtils.deleteNodeByPath(ctx, 'nonexistent');
      expect(ctx.doc.hasIn(asArr('nonexistent'))).toBe(false);
    });

    it('should delete item in a sequence by index', () => {
      YamlUtils.deleteNodeByPath(ctx, 'sequence_example.1');
      expect(asYaml(ctx.doc.getIn(asArr('sequence_example')))).toEqual(yaml`
        - apple
        - cherry
      `);
    });

    it('should delete item in a sequence by glob', () => {
      YamlUtils.deleteNodeByPath(ctx, 'sequence_example.*');
      expect(asYaml(ctx.doc.getIn(asArr('sequence_example')))).toEqual(yaml`
        []
      `);
    });

    it('should not delete empty parent when removeIfEmptyGlob is not provided', () => {
      YamlUtils.deleteNodeByPath(ctx, 'complex_mapping.country.states.*.name');
      YamlUtils.deleteNodeByPath(ctx, 'complex_mapping.country.states.*.capital');
      expect(asYaml(ctx.doc.getIn(asArr('complex_mapping.country')))).toEqual(yaml`
        name: "United States"
        states:
          - {}
          - {}
      `);
    });

    it('should delete empty parents recursively when removeIfEmptyGlob is "*"', () => {
      YamlUtils.deleteNodeByPath(ctx, 'complex_mapping.country.states.*.name', '*');
      YamlUtils.deleteNodeByPath(ctx, 'complex_mapping.country.states.*.capital', '*');
      expect(asYaml(ctx.doc.getIn(asArr('complex_mapping.country')))).toEqual(yaml`
        name: "United States"
      `);
    });

    it('should delete empty parent when removeIfEmptyGlob is matching its path', () => {
      const removeIfEmptyGlob = 'complex_mapping.country.states.*';
      YamlUtils.deleteNodeByPath(ctx, 'complex_mapping.country.states.*.name', removeIfEmptyGlob);
      YamlUtils.deleteNodeByPath(ctx, 'complex_mapping.country.states.*.capital', removeIfEmptyGlob);
      expect(asYaml(ctx.doc.getIn(asArr('complex_mapping.country')))).toEqual(yaml`
        name: "United States"
        states: []
      `);
    });
  });

  describe('deleteNodeByValue', () => {
    it('should delete a node by value in the document', () => {
      YamlUtils.deleteNodeByValue(ctx, 'root', 'root value');
      expect(ctx.doc.hasIn(asArr('root'))).toBe(false);
      expect(ctx.doc.getIn(asArr('root'))).toBeUndefined();
    });

    it('should delete a value from a sequence in the document', () => {
      YamlUtils.deleteNodeByValue(ctx, 'sequence_example.*', 'banana');
      expect(asYaml(ctx.doc.getIn(asArr('sequence_example')))).toEqual(yaml`
        - apple
        - cherry
      `);
    });

    it('should delete a node by value in a map in the document', () => {
      YamlUtils.deleteNodeByValue(ctx, 'event.*', 'Conference');
      expect(asYaml(ctx.doc.getIn(asArr('event')))).toEqual(yaml`
        date: 2023-10-15
        time: 10:00:00
      `);
    });

    it('should delete node by glob path and value from a map in the document', () => {
      YamlUtils.deleteNodeByValue(ctx, 'complex_mapping.country.states.*.name', 'Texas');
      expect(asYaml(ctx.doc.getIn(asArr('complex_mapping.country.states')))).toEqual(yaml`
        - name: "California"
          capital: "Sacramento"
        - capital: "Austin"
      `);
    });

    it('should not delete empty parent when removeIfEmptyGlob is not provided', () => {
      YamlUtils.deleteNodeByValue(ctx, 'complex_mapping.country.states.*.name', 'Texas');
      YamlUtils.deleteNodeByValue(ctx, 'complex_mapping.country.states.*.capital', 'Austin');
      expect(asYaml(ctx.doc.getIn(asArr('complex_mapping.country.states')))).toEqual(yaml`
        - name: "California"
          capital: "Sacramento"
        - {}
      `);
    });

    it('should delete empty parent when removeIfEmptyGlob is "*"', () => {
      YamlUtils.deleteNodeByValue(ctx, 'complex_mapping.country.states.*.name', 'Texas', '*');
      YamlUtils.deleteNodeByValue(ctx, 'complex_mapping.country.states.*.capital', 'Austin', '*');
      expect(asYaml(ctx.doc.getIn(asArr('complex_mapping.country.states')))).toEqual(yaml`
        - name: "California"
          capital: "Sacramento"
      `);
    });

    it('should delete empty parent recursively when removeIfEmptyGlob is "*"', () => {
      YamlUtils.deleteNodeByValue(ctx, 'complex_mapping.country.states.*.name', 'Texas', '*');
      YamlUtils.deleteNodeByValue(ctx, 'complex_mapping.country.states.*.capital', 'Austin', '*');
      YamlUtils.deleteNodeByValue(ctx, 'complex_mapping.country.states.*.name', 'California', '*');
      YamlUtils.deleteNodeByValue(ctx, 'complex_mapping.country.states.*.capital', 'Sacramento', '*');
      expect(asYaml(ctx.doc.getIn(asArr('complex_mapping.country')))).toEqual(yaml`
        name: "United States"
      `);
    });

    it('should delete empty parent when removeIfEmptyGlob is matching its path', () => {
      const removeIfEmptyGlob = 'complex_mapping.country.states.*';
      YamlUtils.deleteNodeByValue(ctx, 'complex_mapping.country.states.*.name', 'Texas', removeIfEmptyGlob);
      YamlUtils.deleteNodeByValue(ctx, 'complex_mapping.country.states.*.capital', 'Austin', removeIfEmptyGlob);
      YamlUtils.deleteNodeByValue(ctx, 'complex_mapping.country.states.*.name', 'California', removeIfEmptyGlob);
      YamlUtils.deleteNodeByValue(ctx, 'complex_mapping.country.states.*.capital', 'Sacramento', removeIfEmptyGlob);
      expect(asYaml(ctx.doc.getIn(asArr('complex_mapping.country')))).toEqual(yaml`
        name: "United States"
        states: []
      `);
    });
  });

  describe('getSeqIn', () => {
    it('should return the sequence at the specified path', () => {
      const seq = ctx.doc.getIn(asArr('complex_mapping.country.states'));
      expect(seq).toBeDefined();
      expect(YamlUtils.getSeqIn(ctx.doc, asArr('complex_mapping.country.states'))).toBe(seq);
    });

    it('should return undefined when path does not exist', () => {
      expect(YamlUtils.getSeqIn(ctx.doc, asArr('complex_mapping.nonexistent'))).toBeUndefined();
    });

    it('should create and return sequence when createIfNotExists is true', () => {
      expect(ctx.doc.hasIn(asArr('new_root.new_mapping.new_sequence'))).toBe(false);

      const seq = YamlUtils.getSeqIn(ctx.doc, asArr('new_root.new_mapping.new_sequence'), true);

      expect(seq).toBeDefined();
      expect(seq.items).toHaveLength(0);
      expect(ctx.doc.getIn(asArr('new_root.new_mapping.new_sequence'))).toBe(seq);
    });

    it('should create and return sequence and change parent flow to false when createIfNotExists is true and parent is empty', () => {
      expect(ctx.doc.hasIn(asArr('flow_root.flow_mapping.new_seq'))).toBe(false);

      YamlUtils.getSeqIn(ctx.doc, asArr('flow_root.flow_mapping.new_seq'), true);

      const seq = YamlUtils.getSeqIn(ctx.doc, asArr('flow_root.flow_mapping.new_seq'), true);

      expect(seq).toBeDefined();
      expect(seq.items).toHaveLength(0);
      expect(stringify(ctx.doc.get('flow_root'))).toEqual(yaml`
        flow_mapping:
          new_seq: []
        flow_sequence: []
      `);
    });

    it('should create and return sequence when createIfNotExists is true and one of its parent is missing', () => {
      const doc = parseDocument(yaml`
        workflows:
          wf1:
            steps:
      `);

      expect(doc.hasIn(asArr('workflows.wf1.steps.0.script.inputs'))).toBe(false);

      const seq = YamlUtils.getSeqIn(doc, asArr('workflows.wf1.steps.0.script.inputs'), true);

      expect(seq).toBeDefined();
      expect(seq.items).toHaveLength(0);
      expect(doc.getIn(asArr('workflows.wf1.steps.0.script.inputs'))).toBe(seq);
    });
  });

  describe('getMapIn', () => {
    it('should return the map at the specified path', () => {
      const map = ctx.doc.getIn(asArr('mapping_example'));
      expect(map).toBeDefined();
      expect(YamlUtils.getMapIn(ctx.doc, asArr('mapping_example'))).toBe(map);
    });

    it('should return undefined when path does not exist', () => {
      expect(YamlUtils.getMapIn(ctx.doc, asArr('complex_mapping.nonexistent'))).toBeUndefined();
    });

    it('should create and return map when createIfNotExists is true', () => {
      expect(ctx.doc.hasIn(asArr('new_root.new_mapping.new_map'))).toBe(false);

      const map = YamlUtils.getMapIn(ctx.doc, asArr('new_root.new_mapping.new_map'), true);

      expect(map).toBeDefined();
      expect(map.items).toHaveLength(0);
      expect(ctx.doc.getIn(asArr('new_root.new_mapping.new_map'))).toBe(map);
    });

    it('should create and return map and change parent flow to false when createIfNotExists is true and parent is empty', () => {
      expect(ctx.doc.hasIn(asArr('flow_root.flow_mapping.new_map'))).toBe(false);

      YamlUtils.getMapIn(ctx.doc, asArr('flow_root.flow_mapping.new_map'), true);

      const map = YamlUtils.getMapIn(ctx.doc, asArr('flow_root.flow_mapping.new_map'), true);

      expect(map).toBeDefined();
      expect(map.items).toHaveLength(0);
      expect(stringify(ctx.doc.get('flow_root'))).toEqual(yaml`
        flow_mapping:
          new_map: {}
        flow_sequence: []
      `);
    });

    it('should create and return map when createIfNotExists is true and one of its parent is missing', () => {
      const doc = parseDocument(yaml`
        workflows:
          wf1:
      `);

      expect(doc.hasIn(asArr('workflows.wf1.steps.0.script'))).toBe(false);

      const map = YamlUtils.getSeqIn(doc, asArr('workflows.wf1.steps.0.script'), true);

      expect(map).toBeDefined();
      expect(map.items).toHaveLength(0);
      expect(doc.getIn(asArr('workflows.wf1.steps.0.script'))).toBe(map);
    });
  });

  describe('safeDeleteIn', () => {
    it('should delete the specified path', () => {
      YamlUtils.safeDeleteIn(ctx.doc, asArr('safe_delete_root.safe_delete_mapping.meta.nested.name'));
      expect(stringify(ctx.doc.get('safe_delete_root'))).toEqual(yaml`
        safe_delete_mapping:
          meta:
            nested: {}
      `);
    });

    it('should not delete anything when the path does not exist', () => {
      YamlUtils.safeDeleteIn(ctx.doc, asArr('complex_mapping.nonexistent'));
      expect(ctx.doc.hasIn(asArr('complex_mapping.nonexistent'))).toBe(false);
    });

    it('should remove empty parent when removeEmptyParent is true', () => {
      YamlUtils.safeDeleteIn(ctx.doc, asArr('safe_delete_root.safe_delete_mapping.meta.nested.name'), true);
      expect(ctx.doc.hasIn(asArr('safe_delete_root'))).toBe(false);
    });

    it('should remove empty parent, when removeEmptyParent is a path of deletable parents', () => {
      YamlUtils.safeDeleteIn(
        ctx.doc,
        asArr('safe_delete_root.safe_delete_mapping.meta.nested.name'),
        asArr('meta.nested'),
      );
      expect(stringify(ctx.doc.get('safe_delete_root'))).toEqual(yaml`
        safe_delete_mapping: {}
      `);
    });
  });

  describe('collectPaths', () => {
    it('should collect paths for simple objects', () => {
      const obj = {
        a: 1,
        b: 'string',
        c: true,
      };
      const paths = YamlUtils.collectPaths(obj);
      expect(paths).toEqual(['a', 'b', 'c']);
    });

    it('should collect paths for nested objects', () => {
      const obj = {
        a: {
          b: {
            c: 1,
          },
          d: 2,
        },
        e: 3,
      };
      const paths = YamlUtils.collectPaths(obj);
      expect(paths).toContain('a');
      expect(paths).toContain('a.b');
      expect(paths).toContain('a.b.c');
      expect(paths).toContain('a.d');
      expect(paths).toContain('e');
      expect(paths).toHaveLength(5);
    });

    it('should collect paths for arrays', () => {
      const obj = {
        arr: [1, 2, 3],
      };
      const paths = YamlUtils.collectPaths(obj);
      expect(paths).toContain('arr');
      expect(paths).toContain('arr.0');
      expect(paths).toContain('arr.1');
      expect(paths).toContain('arr.2');
      expect(paths).toHaveLength(4);
    });

    it('should collect paths for complex nested structures', () => {
      const obj = {
        a: [{ b: 1 }, { c: 2, d: [3, 4] }],
        e: {
          f: [{ g: 5 }],
        },
      };
      const paths = YamlUtils.collectPaths(obj);

      expect(paths).toContain('a');
      expect(paths).toContain('a.0');
      expect(paths).toContain('a.0.b');
      expect(paths).toContain('a.1');
      expect(paths).toContain('a.1.c');
      expect(paths).toContain('a.1.d');
      expect(paths).toContain('a.1.d.0');
      expect(paths).toContain('a.1.d.1');
      expect(paths).toContain('e');
      expect(paths).toContain('e.f');
      expect(paths).toContain('e.f.0');
      expect(paths).toContain('e.f.0.g');
    });

    it('should work with primitive values', () => {
      expect(YamlUtils.collectPaths(1, 'prefix')).toEqual(['prefix']);
      expect(YamlUtils.collectPaths('string', 'prefix')).toEqual(['prefix']);
      expect(YamlUtils.collectPaths(true, 'prefix')).toEqual(['prefix']);
      expect(YamlUtils.collectPaths(null, 'prefix')).toEqual(['prefix']);
    });

    it('should handle empty objects and arrays', () => {
      expect(YamlUtils.collectPaths({}, 'obj')).toEqual(['obj']);
      expect(YamlUtils.collectPaths([], 'arr')).toEqual(['arr']);
    });
  });

  describe('getPairInSeqByKey', () => {
    it('should return the existing pair and index in the sequence by key', () => {
      const seq = ctx.doc.getIn(asArr('final_entry.stages')) as YAMLSeq;
      const [pair, index] = YamlUtils.getPairInSeqByKey(seq, 'implementation');

      expect(index).toBe(1);
      expect(pair?.key?.toString()).toBe('implementation');
      expect(pair?.value?.toString()).toBe('Writing comprehensive examples to showcase YAML features.\n');
    });

    it('should return undefined when the key does not exist', () => {
      const seq = ctx.doc.getIn(asArr('final_entry.stages')) as YAMLSeq;
      const [pair, index] = YamlUtils.getPairInSeqByKey(seq, 'nonexistent');

      expect(index).toBeUndefined();
      expect(pair).toBeUndefined();
    });

    it('should create and return a new pair when createIfNotExists is true', () => {
      const seq = ctx.doc.getIn(asArr('final_entry.stages')) as YAMLSeq;
      const [pair, index] = YamlUtils.getPairInSeqByKey(seq, 'new_key', true);

      expect(index).toBe(3);
      expect(pair?.key?.toString()).toBe('new_key');
      expect(pair?.value?.toString()).toBe('');

      expect(BitriseYmlApi.toYml(seq)).toEqual(yaml`
        - research: >
            Understanding the basics of YAML, looking into version differences.
        - implementation: >
            Writing comprehensive examples to showcase YAML features.
        - testing:
          - ensure valid YAML
          - check parsers for compatibility
        - new_key: ""
      `);
    });
  });

  describe('isInSeq', () => {
    it('should return true if primitive in a sequence', () => {
      const seq = ctx.doc.getIn(asArr('sequence_example')) as YAMLSeq;
      expect(YamlUtils.isInSeq(seq, 'banana')).toBe(true);
    });

    it('should return true if scalar in a sequence', () => {
      const seq = ctx.doc.getIn(asArr('sequence_example')) as YAMLSeq;
      expect(YamlUtils.isInSeq(seq, new Scalar('banana'))).toBe(true);
    });

    it('should return true if item in a sequence by index', () => {
      const seq = ctx.doc.getIn(asArr('sequence_example'));
      expect(YamlUtils.isInSeq(seq, 'apple', 0)).toBe(true);
    });

    it('should return true if object in a sequence', () => {
      const seq = ctx.doc.getIn(asArr('complex_mapping.country.states'));
      expect(YamlUtils.isInSeq(seq, { name: 'California', capital: 'Sacramento' })).toBe(true);
    });

    it('should return true if a YAMLMap in a sequence', () => {
      const seq = ctx.doc.getIn(asArr('complex_mapping.country.states'));
      const map = YamlUtils.getMapIn(ctx.doc, asArr('complex_mapping.country.states.0'));
      expect(YamlUtils.isInSeq(seq, map)).toBe(true);
    });

    it('should return false if item not in a sequence', () => {
      const seq = ctx.doc.getIn(asArr('sequence_example'));
      expect(YamlUtils.isInSeq(seq, 'nonexistent')).toBe(false);
    });

    it('should return false if item not in a sequence by index', () => {
      const seq = ctx.doc.getIn(asArr('sequence_example'));
      expect(YamlUtils.isInSeq(seq, 'apple', 1)).toBe(false);
    });

    it('should return false if object not in a sequence', () => {
      const seq = ctx.doc.getIn(asArr('complex_mapping.country.states'));
      expect(YamlUtils.isInSeq(seq, { name: 'Nonexistent', capital: 'Nowhere' })).toBe(false);
    });

    it('should return false if a YAMLMap not in a sequence by index', () => {
      const seq = ctx.doc.getIn(asArr('complex_mapping.country.states'));
      const map = YamlUtils.getMapIn(ctx.doc, asArr('complex_mapping.country.states.0'));
      expect(YamlUtils.isInSeq(seq, map, 1)).toBe(false);
    });

    it('should return false if a YAMLMap not in a sequence', () => {
      const seq = ctx.doc.getIn(asArr('complex_mapping.country.states'));
      const map = ctx.doc.createNode({ name: 'Nonexistent', capital: 'Nowhere' }) as YAMLMap;
      expect(YamlUtils.isInSeq(seq, map)).toBe(false);
    });

    it('should return false if sequence is empty', () => {
      const seq = new YAMLSeq();
      expect(YamlUtils.isInSeq(seq, 'anything')).toBe(false);
    });

    it('should return false if sequence is not a YAMLSeq', () => {
      expect(YamlUtils.isInSeq(ctx.doc.createNode({}), 'anything')).toBe(false);
      expect(YamlUtils.isInSeq(ctx.doc.createNode(123), 'anything')).toBe(false);
      expect(YamlUtils.isInSeq(ctx.doc.createNode(null), 'anything')).toBe(false);
      expect(YamlUtils.isInSeq(ctx.doc.createNode(undefined), 'anything')).toBe(false);
    });
  });
});
