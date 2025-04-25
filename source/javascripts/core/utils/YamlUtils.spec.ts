import { parseDocument } from 'yaml';

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
  });
});
