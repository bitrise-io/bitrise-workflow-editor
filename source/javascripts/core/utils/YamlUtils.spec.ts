import { parseDocument, stringify } from 'yaml';

import { YamlMutatorCtx } from '../stores/BitriseYmlStore';
import YamlUtils from './YamlUtils';
import YamlExample from './YamlUtils.yaml';

const orinalYamlDocument = parseDocument(YamlExample);

const asArr = (path: string) => path.split('.');

describe('YamlUtils', () => {
  let ctx: YamlMutatorCtx;

  beforeEach(() => {
    ctx = {
      doc: orinalYamlDocument.clone(),
      paths: YamlUtils.collectPaths(orinalYamlDocument.toJSON()),
    };
  });

  describe('updateValue', () => {
    it('should update a value in the document', () => {
      YamlUtils.updateValue(ctx, 'root', 'new value');
      expect(ctx.doc.getIn(asArr('root'))).toBe('new value');
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

    it('should not update when the path is not found', () => {
      YamlUtils.updateValue(ctx, 'nonexistent', 'new value');
      expect(ctx.doc.hasIn(asArr('nonexistent'))).toBe(false);
    });
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
      expect(seq?.items.length).toBe(0);
      expect(ctx.doc.getIn(asArr('new_root.new_mapping.new_sequence'))).toBe(seq);
    });

    it('should create and return sequence and change parent flow to false when createIfNotExists is true and parent is empty', () => {
      expect(ctx.doc.hasIn(asArr('flow_root.flow_mapping.new_seq'))).toBe(false);

      YamlUtils.getSeqIn(ctx.doc, asArr('flow_root.flow_mapping.new_seq'), true);

      const seq = YamlUtils.getSeqIn(ctx.doc, asArr('flow_root.flow_mapping.new_seq'), true);

      expect(seq).toBeDefined();
      expect(seq?.items.length).toBe(0);
      expect(stringify(ctx.doc.get('flow_root'))).toEqual(yaml`
        flow_mapping:
          new_seq: []
        flow_sequence: []
      `);
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
      expect(map?.items.length).toBe(0);
      expect(ctx.doc.getIn(asArr('new_root.new_mapping.new_map'))).toBe(map);
    });

    it('should create and return map and change parent flow to false when createIfNotExists is true and parent is empty', () => {
      expect(ctx.doc.hasIn(asArr('flow_root.flow_mapping.new_map'))).toBe(false);

      YamlUtils.getMapIn(ctx.doc, asArr('flow_root.flow_mapping.new_map'), true);

      const map = YamlUtils.getMapIn(ctx.doc, asArr('flow_root.flow_mapping.new_map'), true);

      expect(map).toBeDefined();
      expect(map?.items.length).toBe(0);
      expect(stringify(ctx.doc.get('flow_root'))).toEqual(yaml`
        flow_mapping:
          new_map: {}
        flow_sequence: []
      `);
    });
  });
});
