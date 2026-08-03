import { isMap, Scalar, YAMLMap, YAMLSeq } from 'yaml';

import YmlUtils from './YmlUtils';

describe('YmlUtils', () => {
  describe('toJSON', () => {
    it('should convert a YAML document to JSON', () => {
      const doc = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
              - script: {}
      `);
      const json = YmlUtils.toJSON(doc);
      expect(json).toEqual({
        workflows: {
          wf1: {
            steps: [{ script: {} }],
          },
        },
      });
    });

    it('should handle null document gracefully', () => {
      const doc = YmlUtils.toDoc('');
      const json = YmlUtils.toJSON(doc);
      expect(json).not.toBeNull();
    });
  });

  describe('toScalar', () => {
    it('should convert a string to a YAML scalar', () => {
      const result = YmlUtils.toScalar('test');
      expect(YmlUtils.toYml(result)).toEqual(yaml`test`);
    });

    describe('empty strings', () => {
      ['', '', ' ', '  '].forEach((value) => {
        it(`converts "${value}" to empty string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`""`);
        });
      });
    });

    describe('nulls', () => {
      ['~', 'null', 'NULL'].forEach((value) => {
        it(`converts "${value}" to null`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`null`);
        });
      });
    });

    describe('booleans', () => {
      ['true', 'TRUE'].forEach((value) => {
        it(`converts "${value}" to true`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`true`);
        });
      });

      ['false', 'FALSE'].forEach((value) => {
        it(`converts "${value}" to false`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`false`);
        });
      });
    });

    describe('boolean like strings', () => {
      ['yes', 'YES', 'on', 'ON', 'no', 'NO', 'off', 'OFF', 'y', 'Y', 'n', 'N'].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('integers', () => {
      ['0', '1', '+1', '-1', '42', '+42', '-42', '100', '+100', '-100'].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('integers with thousand separator', () => {
      ['1_234', '+1_234', '-1_234', '1,234', '+1,234', '-1,234'].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('integers with leading zeros', () => {
      [
        '01234',
        '+01234',
        '-01234',
        '0001234',
        '+0001234',
        '-0001234',
        '001_234',
        '+001_234',
        '-001_234',
        '001,234',
        '+001,234',
        '-001,234',
      ].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('floats', () => {
      ['0.123', '+0.123', '-0.123', '.123', '+.123', '-.123', '123.456', '+123.456', '-123.456'].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('floats with thousand separator', () => {
      ['1_234.567', '+1_234.567', '-1_234.567', '1,234.567', '+1,234.567', '-1,234.567'].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('floats with leading zeros', () => {
      [
        '01.234',
        '0001.234',
        '001_234.567',
        '+001_234.567',
        '-001_234.567',
        '001,234.567',
        '+001,234.567',
        '-001,234.567',
      ].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('floats with trailing zeros', () => {
      [
        '1.2340',
        '+1.2340',
        '-1.2340',
        '1.234000',
        '+1.234000',
        '-1.234000',
        '1_234.5670',
        '+1_234.5670',
        '-1_234.5670',
        '1,234.5670',
        '+1,234.5670',
        '-1,234.5670',
      ].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('special floats', () => {
      ['.inf', '.INF'].forEach((value) => {
        it(`converts "${value}" to .inf`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`.inf`);
        });
      });

      ['-.inf', '-.INF'].forEach((value) => {
        it(`converts "${value}" to -.inf`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`-.inf`);
        });
      });

      ['.nan', '.NAN'].forEach((value) => {
        it(`converts "${value}" to .nan`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`.nan`);
        });
      });
    });

    describe('hex/octal/binary', () => {
      ['0x1A', '0X1A', '0o12', '0O12', '0b101', '0B101'].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('scientific notation', () => {
      [
        '0.314e1',
        '+0.314e1',
        '-0.314e1',
        '0.314E1',
        '+0.314E1',
        '-0.314E1',
        '0.314e+1',
        '+0.314e+1',
        '-0.314e+1',
        '0.314E+1',
        '+0.314E+1',
        '-0.314E+1',
        '0.314e-1',
        '+0.314e-1',
        '-0.314e-1',
        '0.314E-1',
        '+0.314E-1',
        '-0.314E-1',
      ].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('comma-separated numbers', () => {
      ['1,2', '1234,5678', '0.1,0.2', '3.14,2.71'].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('underscore-separated numbers', () => {
      ['1_2', '1234_5678', '0.1_0.2', '3.14_2.71'].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('date/time & timestamp formats', () => {
      [
        '2023-10-01',
        '2023-10-01T12:00:00Z',
        '2023-10-01 12:00:00',
        '2023-10-01T12:00:00Z',
        '2023-10-01T12:00:00+02:00',
      ].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('time format/port mappings', () => {
      ['10:30', '10:30:20', '3000:80'].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('version numbers', () => {
      [
        '3',
        '3.2',
        '3.20',
        '1.2.3',
        '10.0.0',
        '1.2.3-alpha',
        '1.2.3-rc.1',
        '1.2.3+build.456',
        '2.0.0+20250613',
        '1.0.0-alpha+001',
      ].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    describe('should quote YAML special characters', () => {
      [
        '&anchor',
        '*alias',
        '%directive',
        '#comment',
        '!tag',
        '?key',
        ':value',
        '|literal',
        '>folded',
        '-item',
        '[seq',
        '{map',
        '@asd',
        'value: with colon',
      ].forEach((value) => {
        it(`keeps "${value}" as quoted string`, () => {
          const result = YmlUtils.toScalar(value);
          expect(YmlUtils.toYml(result)).toEqual(yaml`"${value}"`);
        });
      });
    });

    it('keeps single quote style', () => {
      const scalar = new Scalar('abc');
      scalar.type = Scalar.QUOTE_SINGLE;
      const result = YmlUtils.toScalar('def', scalar);
      expect(YmlUtils.toYml(result)).toEqual(yaml`'def'`);
    });

    it('keeps double quote style', () => {
      const scalar = new Scalar('abc');
      scalar.type = Scalar.QUOTE_DOUBLE;
      const result = YmlUtils.toScalar('def', scalar);
      expect(YmlUtils.toYml(result)).toEqual(yaml`"def"`);
    });
  });

  describe('unflowEmptyCollection', () => {
    it('should change the flow type of an empty YmlSeq to block style', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps: []
      `);

      const seq = root.getIn(['workflows', 'wf1', 'steps'], true) as YAMLSeq;
      expect(seq).toBeInstanceOf(YAMLSeq);
      expect(seq.flow).toBe(true);

      YmlUtils.unflowEmptyCollection(seq);

      expect(seq.flow).toBe(false);
      seq.add({ script: {} });

      expect(YmlUtils.toYml(root)).toBe(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
      `);
    });

    it('should not change the flow type of a non-empty YmlSeq', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps: [{script: {}}]
      `);

      const seq = root.getIn(['workflows', 'wf1', 'steps'], true) as YAMLSeq;
      expect(seq).toBeInstanceOf(YAMLSeq);
      expect(seq.flow).toBe(true);

      YmlUtils.unflowEmptyCollection(seq);

      expect(seq.flow).toBe(true);
      expect(YmlUtils.toYml(root)).toBe(yaml`
        workflows:
          wf1:
            steps: [{script: {}}]
      `);
    });

    it('should change the flow type of an empty YmlMap to block style', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1: {}
      `);

      const map = root.getIn(['workflows', 'wf1'], true) as YAMLMap;
      expect(map).toBeInstanceOf(YAMLMap);
      expect(map.flow).toBe(true);

      YmlUtils.unflowEmptyCollection(map);

      expect(map.flow).toBe(false);
      map.set('steps', new YAMLSeq());

      expect(YmlUtils.toYml(root)).toBe(yaml`
        workflows:
          wf1:
            steps: []
      `);
    });

    it('should not change the flow type of a non-empty YmlMap', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1: {steps: [{script: {}}]}
      `);

      const map = root.getIn(['workflows', 'wf1'], true) as YAMLMap;
      expect(map).toBeInstanceOf(YAMLMap);
      expect(map.flow).toBe(true);

      YmlUtils.unflowEmptyCollection(map);

      expect(map.flow).toBe(true);
      expect(YmlUtils.toYml(root)).toBe(yaml`
        workflows:
          wf1: {steps: [{script: {}}]}
      `);
    });
  });

  describe('getMatchingPaths', () => {
    it('should find all matching paths in a YAML document', () => {
      const root = YmlUtils.toDoc(`
        containers:
          node:
            type: execution
            image: node:24
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: node
              - script: {}
              - script: {}
          wf2:
            steps:
              - deploy:
                  execution_container: node
      `);

      const paths = YmlUtils.getMatchingPaths(root, ['workflows', '*', 'steps', '*', '*', 'execution_container']);

      expect(paths).toEqual([
        [['workflows', 'wf2', 'steps', 0, 'deploy', 'execution_container'], []],
        [['workflows', 'wf1', 'steps', 0, 'script', 'execution_container'], []],
      ]);
    });
  });

  describe('collectPaths', () => {
    it('should collect paths from a YAML document', () => {
      const root = YmlUtils.toDoc(`
        workflows:
          wf1:
            steps:
              - script: {}
              - clone: {}
          wf2:
            steps:
              - deploy: {}
          123:
            steps:
              - test: {}
      `);

      const paths = YmlUtils.collectPaths(root);

      expect(paths).toEqual([
        ['workflows', 'wf2', 'steps', 0, 'deploy'],
        ['workflows', 'wf2', 'steps', 0],
        ['workflows', 'wf2', 'steps'],
        ['workflows', 'wf2'],

        ['workflows', 'wf1', 'steps', 1, 'clone'],
        ['workflows', 'wf1', 'steps', 1],

        ['workflows', 'wf1', 'steps', 0, 'script'],
        ['workflows', 'wf1', 'steps', 0],
        ['workflows', 'wf1', 'steps'],
        ['workflows', 'wf1'],

        ['workflows', '123', 'steps', 0, 'test'],
        ['workflows', '123', 'steps', 0],
        ['workflows', '123', 'steps'],
        ['workflows', '123'],

        ['workflows'],
      ]);
    });
  });

  describe('setIn', () => {
    it('should set a value in a YMLMap at the specified path', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1: {}
      `);

      YmlUtils.setIn(root, ['workflows', 'wf1', 'steps'], []);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps: []
      `);
    });

    it('seeds a root collection when setting into an empty document', () => {
      const root = YmlUtils.toDoc('');

      YmlUtils.setIn(root, ['workflows', 'wf1'], {});

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1: {}
      `);
    });

    it('seeds a root collection when the document is a null scalar (saved-then-reloaded empty file)', () => {
      // An empty module file serializes to the literal `null`, which reparses to a null Scalar.
      const root = YmlUtils.toDoc('# modules/new.yml\n\nnull\n');

      YmlUtils.setIn(root, ['workflows', 'wf1'], {});

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        # modules/new.yml

        workflows:
          wf1: {}
      `);
    });

    it('should set a value in a YMLSeq at the specified path', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps: []
      `);

      YmlUtils.setIn(root, ['workflows', 'wf1', 'steps', 0, 'script'], {});

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
      `);
    });

    it('should create intermediate structures if they do not exist', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows: {}
      `);

      YmlUtils.setIn(root, ['workflows', 'wf1', 'steps', 0, 'script'], {});

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
      `);
    });

    it('should overwrite existing values at the specified path', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Old Script
                content: 'echo "Hello World"'
      `);

      YmlUtils.setIn(root, ['workflows', 'wf1', 'steps', 0, 'script', 'title'], 'New Script');

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: New Script
                content: 'echo "Hello World"'
      `);
    });

    it('should unflow an empty YAMLSeq when setting a value', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps: []
      `);

      YmlUtils.setIn(root, ['workflows', 'wf1', 'steps'], [{ script: {} }]);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
      `);
    });

    it('should unflow an empty YAMLMap when setting a value', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1: {}
      `);

      YmlUtils.setIn(root, ['workflows', 'wf1', 'steps'], [{ script: {} }]);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
      `);
    });

    it('should set a value when node is null', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1: null
      `);

      YmlUtils.setIn(root, ['workflows', 'wf1', 'steps'], []);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps: []
      `);
    });

    it('should set null value when "null" string is provided', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            retries: '3'
      `);

      YmlUtils.setIn(root, ['workflows', 'wf1', 'retries'], '~');

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            retries: null
      `);
    });

    it('should not convert string value when stringToTypedValue is false', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            retries: '3'
      `);

      YmlUtils.setIn(root, ['workflows', 'wf1', 'retries'], 'null', false);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            retries: 'null'
      `);
    });

    it('should throw an error if the root is not a YAML Document or YAML collection', () => {
      const root = 'not a yaml document' as unknown as YAMLMap;

      expect(() => YmlUtils.setIn(root, ['workflows', 'wf1', 'steps', 0, 'script'], {})).toThrow(
        'Root node must be a YAML Document or YAML Collection',
      );
    });

    it('should throw an error if the path contains a wildcard', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps: []
      `);

      expect(() => YmlUtils.setIn(root, ['workflows', '*', 'steps', 0, 'script'], {})).toThrow(
        'Path cannot contain wildcards when setting a value',
      );
    });

    it('should throw an error if the path is empty', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps: []
      `);

      expect(() => YmlUtils.setIn(root, [], {})).toThrow('Path cannot be empty when setting a value');
    });
  });

  describe('addIn', () => {
    it('should unflow an empty YMLSeq when adding a value', () => {
      const root = YmlUtils.toDoc(yaml`
          workflows:
            wf1:
              steps: []
        `);

      YmlUtils.addIn(root, ['workflows', 'wf1', 'steps'], { script: {} });

      expect(YmlUtils.toYml(root)).toEqual(yaml`
          workflows:
            wf1:
              steps:
              - script: {}
        `);
    });

    it('should add a value to the end of an existing YMLSeq', () => {
      const root = YmlUtils.toDoc(yaml`
          workflows:
            wf1:
              steps:
              - script: {}
        `);

      YmlUtils.addIn(root, ['workflows', 'wf1', 'steps'], { clone: {} });

      expect(YmlUtils.toYml(root)).toEqual(yaml`
          workflows:
            wf1:
              steps:
              - script: {}
              - clone: {}
        `);
    });

    it('should add multiple values to an existing YMLSeq', () => {
      const root = YmlUtils.toDoc(yaml`
          workflows:
            wf1:
              steps: []
        `);

      YmlUtils.addIn(root, ['workflows', 'wf1', 'steps'], { script: {} });
      YmlUtils.addIn(root, ['workflows', 'wf1', 'steps'], { clone: {} });

      expect(YmlUtils.toYml(root)).toEqual(yaml`
          workflows:
            wf1:
              steps:
              - script: {}
              - clone: {}
        `);
    });

    it('should create a sequence from a null node and add a value to it', () => {
      const root = YmlUtils.toDoc(yaml`
          workflows:
            wf1:
              steps: null
        `);

      YmlUtils.addIn(root, ['workflows', 'wf1', 'steps'], { script: {} });

      expect(YmlUtils.toYml(root)).toEqual(yaml`
          workflows:
            wf1:
              steps:
              - script: {}
        `);
    });

    it("should create a sequence if it doesn't exist and add a value to it", () => {
      const root = YmlUtils.toDoc(yaml`
          workflows: {}
        `);

      YmlUtils.addIn(root, ['workflows', 'wf1', 'steps'], { script: {} });

      expect(YmlUtils.toYml(root)).toEqual(yaml`
          workflows:
            wf1:
              steps:
              - script: {}
        `);
    });

    it('should add a value to the root node if path is empty and root node is a YMLSeq', () => {
      const root = YmlUtils.toDoc(yaml`
          workflows:
            wf1:
              steps: []
        `);

      const seq = root.getIn(['workflows', 'wf1', 'steps'], true) as YAMLSeq;
      YmlUtils.addIn(seq, [], { script: {} });

      expect(YmlUtils.toYml(root)).toEqual(yaml`
          workflows:
            wf1:
              steps:
              - script: {}
        `);
    });

    it('should throw and error if the root is not a YAML Document or YAML collection', () => {
      const root = 'not a yaml document' as unknown as YAMLMap;

      expect(() => YmlUtils.addIn(root, ['workflows', 'wf1', 'steps', 0, 'script'], {})).toThrow(
        'Root node must be a YAML Document or YAML Collection',
      );
    });

    it('should throw an error if the path contains a wildcard', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps: []
      `);

      expect(() => YmlUtils.addIn(root, ['workflows', '*', 'steps', 0, 'script'], {})).toThrow(
        'Path cannot contain wildcards when adding a value',
      );
    });

    it("should throw and error if path doesn't point to a YMLSeq", () => {
      const root = YmlUtils.toDoc(yaml`
          workflows:
            wf1: {}
        `);

      expect(() => YmlUtils.addIn(root, ['workflows', 'wf1'], {})).toThrow('Path should reference a YAMLSeq');
    });
  });

  describe('getSeqIn', () => {
    it('should return YAMLSeq at the specified path', () => {
      const root = YmlUtils.toDoc(yaml`workflows: []`);
      expect(YmlUtils.getSeqIn(root, ['workflows'])).toBeInstanceOf(YAMLSeq);
    });

    it('should return undefined if YAMLSeq does not exist and createIfNotExists is false', () => {
      const root = YmlUtils.toDoc(yaml`workflows: []`);
      expect(YmlUtils.getSeqIn(root, ['workflows', 'wf1', 'steps'])).toBeUndefined();
      expect(YmlUtils.toYml(root)).toEqual(yaml`workflows: []`);
    });

    it('should create YAMLSeq if it does not exist and createIfNotExists is true', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1: {}
      `);

      expect(YmlUtils.getSeqIn(root, ['workflows', 'wf1', 'steps', 0, 'script', 'inputs'], true)).toBeInstanceOf(
        YAMLSeq,
      );

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script:
                inputs: []
      `);
    });

    it('should create root YAMLSeq if it does not exist and createIfNotExists is true', () => {
      const root = YmlUtils.toDoc(yaml``);
      expect(YmlUtils.getSeqIn(root, ['workflows'], true)).toBeInstanceOf(YAMLSeq);
      expect(YmlUtils.toYml(root)).toEqual(yaml`workflows: []`);
    });

    it('should throw an error if the path does not point to a YAMLSeq', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
      `);
      expect(() => YmlUtils.getSeqIn(root, ['workflows', 'wf1', 'steps', 0])).toThrow(
        'Expected a YAMLSeq at path "workflows.wf1.steps.0", but found YAMLMap',
      );
    });
  });

  describe('getMapIn', () => {
    it('should return YAMLMap at the specified path', () => {
      const root = YmlUtils.toDoc(yaml`workflows: {}`);
      expect(YmlUtils.getMapIn(root, ['workflows'])).toBeInstanceOf(YAMLMap);
    });

    it('should return undefined if YAMLMap does not exist and createIfNotExists is false', () => {
      const root = YmlUtils.toDoc(yaml`workflows: {}`);
      expect(YmlUtils.getMapIn(root, ['workflows', 'wf1', 'steps'])).toBeUndefined();
      expect(YmlUtils.toYml(root)).toEqual(yaml`workflows: {}`);
    });

    it('should create YAMLMap if it does not exist and createIfNotExists is true', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1: {}
      `);

      expect(YmlUtils.getMapIn(root, ['workflows', 'wf1', 'steps', 0, 'script'], true)).toBeInstanceOf(YAMLMap);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
      `);
    });

    it('should create root YAMLMap if it does not exist and createIfNotExists is true', () => {
      const root = YmlUtils.toDoc(yaml``);
      expect(YmlUtils.getMapIn(root, ['workflows'], true)).toBeInstanceOf(YAMLMap);
      expect(YmlUtils.toYml(root)).toEqual(yaml`workflows: {}`);
    });

    it('should throw an error if the path does not point to a YAMLMap', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script:
                inputs:
                - key: value
      `);

      expect(() => YmlUtils.getMapIn(root, ['workflows', 'wf1', 'steps', 0, 'script', 'inputs', 0, 'key'])).toThrow(
        'Expected a YAMLMap at path "workflows.wf1.steps.0.script.inputs.0.key", but found Scalar',
      );
    });
  });

  describe('isInSeq', () => {
    it('should return true the YMLSeq contains the given value', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
            - clone: {}
            - deploy: {}
      `);

      expect(YmlUtils.isInSeq(root, ['workflows', 'wf1', 'steps'], { script: {} })).toBe(true);
    });

    it('should return true if the YMLSeq contains the given value at the exact index', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
            - clone: {}
            - deploy: {}
      `);

      expect(YmlUtils.isInSeq(root, ['workflows', 'wf1', 'steps'], { clone: {} }, 1)).toBe(true);
    });

    it('should return false if the YMLSeq does not contain the given value', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
            - clone: {}
            - deploy: {}
      `);

      expect(YmlUtils.isInSeq(root, ['workflows', 'wf1', 'steps'], { test: {} })).toBe(false);
    });

    it('should return false if the YMLSeq does not contain the given value at the exact index', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
            - clone: {}
            - deploy: {}
      `);

      expect(YmlUtils.isInSeq(root, ['workflows', 'wf1', 'steps'], { deploy: {} }, 0)).toBe(false);
    });

    it('should return false if the path does not point to a YMLSeq', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps: {}
      `);

      expect(YmlUtils.isInSeq(root, ['workflows', 'wf1', 'steps'], { script: {} })).toBe(false);
    });

    it('should throw an error if the path contains a wildcard', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
            - clone: {}
      `);

      expect(() => YmlUtils.isInSeq(root, ['workflows', '*', 'steps'], { script: {} })).toThrow(
        'Path cannot contain wildcards when checking if an item is in a YAMLSeq',
      );
    });

    it('should throw and error if root is not a YAML Document or YAML collection', () => {
      const root = 'not a yaml document' as unknown as YAMLMap;

      expect(() => YmlUtils.isInSeq(root, ['workflows', 'wf1', 'steps'], { script: {} })).toThrow(
        'Root node must be a YAML Document or YAML Collection',
      );
    });
  });

  describe('deleteByPath', () => {
    it('should delete an item at the specified path', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
          wf2: {}
      `);

      YmlUtils.deleteByPath(root, ['workflows', 'wf1', 'steps', '0']);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf2: {}
      `);
    });

    it('should not delete anything if the path does not exist', () => {
      const root = YmlUtils.toDoc(yaml`workflows: {}`);
      YmlUtils.deleteByPath(root, ['workflows', 'wf1'], ['workflows']);
      expect(YmlUtils.toYml(root)).toEqual(yaml`workflows: {}`);
    });

    it('should delete an empty collection if it becomes empty after deletion', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
      `);

      YmlUtils.deleteByPath(root, ['workflows', 'wf1', 'steps', '0'], ['workflows']);

      expect(YmlUtils.toYml(root)).toEqual(yaml`workflows: {}`);
    });

    it('should call afterRemove callback with the deleted node', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
      `);

      const afterRemove = jest.fn();

      const afterRemoveParams = [
        [root.getIn(['workflows', 'wf1'], true), ['workflows', 'wf1']],
        [root.getIn(['workflows', 'wf1', 'steps'], true), ['workflows', 'wf1', 'steps']],
        [root.getIn(['workflows', 'wf1', 'steps', '0'], true), ['workflows', 'wf1', 'steps', '0']],
      ];

      YmlUtils.deleteByPath(root, ['workflows', 'wf1', 'steps', '0'], ['workflows'], afterRemove);

      expect(afterRemove).toHaveBeenCalledTimes(3);
      expect(afterRemove).toHaveBeenCalledWith(...afterRemoveParams[0]);
      expect(afterRemove).toHaveBeenCalledWith(...afterRemoveParams[1]);
      expect(afterRemove).toHaveBeenCalledWith(...afterRemoveParams[2]);
      expect(YmlUtils.toYml(root)).toEqual(yaml`workflows: {}`);
    });

    it('should not delete the parent if it is not empty', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            title: Workflow 1
            steps:
            - script: {}
          wf2: {}
      `);

      YmlUtils.deleteByPath(root, ['workflows', 'wf1', 'steps', '0']);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            title: Workflow 1
          wf2: {}
      `);
    });

    it('should delete multiple items matching a wildcard path', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
          wf2:
            steps:
            - deploy: {}
      `);

      YmlUtils.deleteByPath(root, ['workflows', '*', 'steps', '*'], ['workflows']);

      expect(YmlUtils.toYml(root)).toEqual(yaml`workflows: {}`);
    });

    it('should not delete the parent if keep contains wildcard', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
            - clone: {}
          wf2:
            steps:
            - deploy: {}
      `);

      YmlUtils.deleteByPath(root, ['workflows', '*', 'steps', '*'], ['workflows', '*']);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1: {}
          wf2: {}
      `);
    });
  });

  describe('deleteByValue', () => {
    it('should delete an item with a specific value at the specified path', () => {
      const root = YmlUtils.toDoc(yaml`
        steps:
        - script:
            title: Script Step
        - deploy:
            title: Deploy Step
      `);

      YmlUtils.deleteByValue(root, ['steps', 0, 'script', 'title'], 'Script Step', ['steps', 0, 'script']);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        steps:
        - script: {}
        - deploy:
            title: Deploy Step
      `);
    });

    it('should delete an item from a sequence with a specific value', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            depends_on: [ wf2, wf3 ]
          wf2:
            depends_on: [ wf3 ]
          wf3: {}
      `);

      YmlUtils.deleteByValue(root, ['workflows', '*', 'depends_on', '*'], 'wf3', ['workflows', '*']);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            depends_on: [ wf2 ]
          wf2: {}
          wf3: {}
      `);
    });

    it('should not delete anything if the value does not match', () => {
      const root = YmlUtils.toDoc(yaml`
        steps:
        - script:
            title: Script Step
        - deploy:
            title: Deploy Step
      `);

      YmlUtils.deleteByValue(root, ['steps', 0, 'script', 'title'], 'Not Exists', ['steps', 0, 'script']);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        steps:
        - script:
            title: Script Step
        - deploy:
            title: Deploy Step
      `);
    });

    it('should delete multiple items matching a wildcard path', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
            - deploy: {}
          wf2:
            steps:
            - deploy: {}
            - clone: {}
      `);

      YmlUtils.deleteByValue(root, ['workflows', '*', 'steps', '*'], { deploy: {} }, ['workflows']);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
          wf2:
            steps:
            - clone: {}
      `);
    });

    it('should not delete the parent if it is not empty', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            title: Workflow 1
            steps:
            - deploy: {}
          wf2:
            steps:
            - deploy: {}
      `);

      YmlUtils.deleteByValue(root, ['workflows', '*', 'steps', '*'], { deploy: {} }, ['workflows']);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            title: Workflow 1
      `);
    });
  });

  describe('deleteByPredicate', () => {
    it('should delete an item matching a predicate at the specified path', () => {
      const root = YmlUtils.toDoc(yaml`
        steps:
        - script:
            title: Script Step
            content: "Hello World"
        - script:
            title: Script Step
            content: "Another Script"
        - deploy:
            title: Deploy Step
      `);

      YmlUtils.deleteByPredicate(
        root,
        ['steps', '*'],
        (node) => isMap(node) && node.getIn(['script', 'content']) === 'Hello World',
      );

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        steps:
        - script:
            title: Script Step
            content: "Another Script"
        - deploy:
            title: Deploy Step
      `);
    });

    it('should not delete anything if the predicate does not match', () => {
      const root = YmlUtils.toDoc(yaml`
        steps:
        - script:
            title: Script Step
        - deploy:
            title: Deploy Step
      `);

      YmlUtils.deleteByPredicate(root, ['steps', '*'], (node) => node === 'Not Exists');

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        steps:
        - script:
            title: Script Step
        - deploy:
            title: Deploy Step
      `);
    });

    it('should delete multiple items matching a wildcard path', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
            - deploy: {}
          wf2:
            steps:
            - deploy: {}
            - clone: {}
      `);

      YmlUtils.deleteByPredicate(root, ['workflows', '*', 'steps', '*'], (node) => isMap(node) && node.has('deploy'), [
        'workflows',
      ]);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
          wf2:
            steps:
            - clone: {}
      `);
    });

    it('should not delete the parent if it is not empty', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            title: Workflow 1
            steps:
            - deploy: {}
          wf2:
            steps:
            - deploy: {}
      `);

      YmlUtils.deleteByPredicate(root, ['workflows', '*', 'steps', '*'], (node) => isMap(node) && node.has('deploy'), [
        'workflows',
      ]);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            title: Workflow 1
      `);
    });
  });

  describe('updateKeyByPath', () => {
    it('should update a key at the specified path', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
      `);

      YmlUtils.updateKeyByPath(root, ['workflows', 'wf1', 'steps', '0', 'script'], 'newScript');

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - newScript: {}
      `);
    });

    it('should update multiple keys matching a wildcard path', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
            - deploy: {}
          wf2:
            steps:
            - deploy: {}
      `);

      YmlUtils.updateKeyByPath(root, ['workflows', '*', 'steps', '*', 'deploy'], 'newStep');

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
            - newStep: {}
          wf2:
            steps:
            - newStep: {}
      `);
    });

    it('should update keys after it has been updated', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
      `);

      YmlUtils.updateKeyByPath(root, ['workflows', 'wf1', 'steps', '0', 'script'], 'newScript');
      YmlUtils.updateKeyByPath(root, ['workflows', 'wf1', 'steps', '0', 'newScript'], 'finalScript');

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - finalScript: {}
      `);
    });

    it('should call afterUpdate callback with the updated node', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
          wf2:
            steps:
            - deploy: {}
      `);

      const afterUpdate = jest.fn();
      const afterUpdatePath = ['workflows', 'wf2', 'steps', 0, 'deploy'];
      const afterUpdateNode = root.getIn(afterUpdatePath, true);

      YmlUtils.updateKeyByPath(root, ['workflows', '*', 'steps', '*', 'deploy'], 'newDeploy', afterUpdate);

      expect(afterUpdate).toHaveBeenCalledTimes(1);
      expect(afterUpdate).toHaveBeenCalledWith(afterUpdateNode, afterUpdatePath);
      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
          wf2:
            steps:
            - newDeploy: {}
      `);
    });

    it('should throw an error if the path does not exists in the root', () => {
      const root = YmlUtils.toDoc(yaml`workflows: {}`);

      expect(() => YmlUtils.updateKeyByPath(root, ['workflows', 'wf1', 'steps', '0', 'script'], 'newScript')).toThrow(
        'Node at path "workflows.wf1.steps.0.script" is not a YAML Node',
      );
    });

    it('should throw an error if parent is not a YAMLMap or YAMLPair', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
      `);

      expect(() => YmlUtils.updateKeyByPath(root, ['workflows', 'wf1', 'steps', 0], 'newScript')).toThrow(
        'Parent node at path "workflows.wf1.steps" is not a YAMLMap or YAMLPair',
      );
    });
  });

  describe('updateKeyByPredicate', () => {
    it('should update a key matching a predicate at the specified path', () => {
      const root = YmlUtils.toDoc(yaml`
        steps:
        - script:
            title: Script Step
            content: "Hello World"
        - script:
            title: Script Step
            content: "Another Script"
        - deploy:
            title: Deploy Step
      `);

      YmlUtils.updateKeyByPredicate(
        root,
        ['steps', '*', '*'],
        (node) => isMap(node) && node.get('content') === 'Hello World',
        'newScript',
      );

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        steps:
        - newScript:
            title: Script Step
            content: "Hello World"
        - script:
            title: Script Step
            content: "Another Script"
        - deploy:
            title: Deploy Step
      `);
    });

    it('should not update anything if the predicate does not match', () => {
      const root = YmlUtils.toDoc(yaml`
        steps:
        - script:
            title: Script Step
        - deploy:
            title: Deploy Step
      `);

      YmlUtils.updateKeyByPredicate(root, ['steps', '*', '*'], (node) => node === 'Not Exists', 'newScript');

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        steps:
        - script:
            title: Script Step
        - deploy:
            title: Deploy Step
      `);
    });

    it('should update multiple items matching a wildcard path', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Script Step
            - deploy:
                title: Deploy Step
          wf2:
            steps:
            - deploy:
                title: Deploy Step
            - clone:
                title: Clone Step
      `);

      YmlUtils.updateKeyByPredicate(
        root,
        ['workflows', '*', 'steps', '*', '*'],
        (node) => isMap(node) && node.get('title') === 'Deploy Step',
        'newStep',
      );

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Script Step
            - newStep:
                title: Deploy Step
          wf2:
            steps:
            - newStep:
                title: Deploy Step
            - clone:
                title: Clone Step
      `);
    });

    it('should throw an error if the path does not exists in the root', () => {
      const root = YmlUtils.toDoc(yaml`workflows: {}`);

      expect(() =>
        YmlUtils.updateKeyByPredicate(
          root,
          ['workflows', 'wf1', 'steps', '0', 'script'],
          (node) => node === 'Not Exists',
          'newScript',
        ),
      ).toThrow('Node at path "workflows.wf1.steps.0.script" is not a YAML Node');
    });

    it('should throw an error if parent is not a YAMLMap or YAMLPair', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: {}
      `);

      expect(() =>
        YmlUtils.updateKeyByPredicate(root, ['workflows', 'wf1', 'steps', 0], () => true, 'newScript'),
      ).toThrow('Parent node at path "workflows.wf1.steps" is not a YAMLMap or YAMLPair');
    });
  });

  describe('updateValueByPath', () => {
    it('should update a value at the specified path', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Script Step
      `);

      YmlUtils.updateValueByPath(root, ['workflows', 'wf1', 'steps', 0, 'script', 'title'], 'New Script Title');

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: New Script Title
      `);
    });

    it('should update multiple values matching a wildcard path', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Script Step
            - deploy:
                title: Deploy Step
          wf2:
            steps:
            - deploy:
                title: Deploy Step
      `);

      YmlUtils.updateValueByPath(root, ['workflows', '*', 'steps', '*', 'deploy', 'title'], 'New Deploy Title');

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Script Step
            - deploy:
                title: New Deploy Title
          wf2:
            steps:
            - deploy:
                title: New Deploy Title
      `);
    });

    it('should update values after it has been updated', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Script Step
      `);

      YmlUtils.updateValueByPath(root, ['workflows', 'wf1', 'steps', 0, 'script', 'title'], 'New Script Title');
      YmlUtils.updateValueByPath(root, ['workflows', 'wf1', 'steps', 0, 'script', 'title'], 'Final Script Title');

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Final Script Title
      `);
    });

    it('should call afterUpdate callback with the updated node', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Script Step
          wf2:
            steps:
            - deploy:
                title: Deploy Step
      `);

      const afterUpdate = jest.fn();

      YmlUtils.updateValueByPath(
        root,
        ['workflows', '*', 'steps', '*', 'deploy', 'title'],
        'New Deploy Title',
        afterUpdate,
      );

      const afterUpdatePath = ['workflows', 'wf2', 'steps', 0, 'deploy', 'title'];
      const afterUpdateNode = root.getIn(afterUpdatePath, true);

      expect(afterUpdate).toHaveBeenCalledTimes(1);
      expect(afterUpdate).toHaveBeenCalledWith(afterUpdateNode, afterUpdatePath);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Script Step
          wf2:
            steps:
            - deploy:
                title: New Deploy Title
      `);
    });

    it('should set value as null if the given newValue is undefined', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Script Step
      `);

      YmlUtils.updateValueByPath(root, ['workflows', 'wf1', 'steps', 0, 'script', 'title'], undefined);

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: null
      `);
    });

    it('should add a YAMLSeq as value if the given newValue is an array', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Script Step
      `);

      YmlUtils.updateValueByPath(root, ['workflows', 'wf1', 'steps', 0, 'script', 'title'], ['a', 'b']);

      expect(root.getIn(['workflows', 'wf1', 'steps', 0, 'script', 'title'], true)).toBeInstanceOf(YAMLSeq);
      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title:
                - a
                - b
      `);
    });

    it('should add a YAMLMap as value if the given newValue is an object', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Script Step
      `);

      YmlUtils.updateValueByPath(root, ['workflows', 'wf1', 'steps', 0, 'script', 'title'], { key: 'value' });

      expect(root.getIn(['workflows', 'wf1', 'steps', 0, 'script', 'title'], true)).toBeInstanceOf(YAMLMap);
      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title:
                  key: value
      `);
    });

    it('should keep flow style for YAMLMap if the newValue is an object', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script: { hello: world }
      `);

      YmlUtils.updateValueByPath(root, ['workflows', 'wf1', 'steps', 0, 'script'], { hello: 'zoli' });

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script: { hello: zoli }
      `);
    });

    it('should throw an error if the path does not exists in the root', () => {
      const root = YmlUtils.toDoc(yaml`workflows: {}`);

      expect(() =>
        YmlUtils.updateValueByPath(root, ['workflows', 'wf1', 'steps', 0, 'script', 'title'], 'New Script Title'),
      ).toThrow('Node at path "workflows.wf1.steps.0.script.title" is not a YAML Node');
    });
  });

  describe('updateValueByValue', () => {
    it('should update an item in a sequence if values are matching', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            depends_on: [ wf2, wf3 ]
          wf2:
            depends_on: [ wf3 ]
          wf3: {}
          wf4: {}
      `);

      YmlUtils.updateValueByValue(root, ['workflows', '*', 'depends_on', '*'], 'wf3', 'wf4');

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            depends_on: [ wf2, wf4 ]
          wf2:
            depends_on: [ wf4 ]
          wf3: {}
          wf4: {}
      `);
    });

    it('should update multiple items matching a wildcard path and values are matching', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            depends_on: [ wf2, wf3 ]
          wf2:
            depends_on: [ wf3 ]
          wf3: {}
          wf4: {}
      `);

      YmlUtils.updateValueByValue(root, ['workflows', '*'], {}, { title: 'Empty Workflow' });

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            depends_on: [ wf2, wf3 ]
          wf2:
            depends_on: [ wf3 ]
          wf3:
            title: Empty Workflow
          wf4:
            title: Empty Workflow
      `);
    });

    it('should not update anything if the value does not match', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            depends_on: [ wf2, wf3 ]
          wf2:
            depends_on: [ wf3 ]
          wf3: {}
      `);

      YmlUtils.updateValueByValue(root, ['workflows', '*', 'depends_on', '*'], 'wf4', 'wf5');

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            depends_on: [ wf2, wf3 ]
          wf2:
            depends_on: [ wf3 ]
          wf3: {}
      `);
    });

    it('should throw an error if the path does not exists in the root', () => {
      const root = YmlUtils.toDoc(yaml`workflows: {}`);

      expect(() => YmlUtils.updateValueByValue(root, ['workflows', 'wf1', 'steps'], 'Old Title', 'New Title')).toThrow(
        'Node at path "workflows.wf1.steps" is not a YAML Node',
      );
    });
  });

  describe('updateValueByPredicate', () => {
    it('should update a value matching a predicate at the specified path', () => {
      const root = YmlUtils.toDoc(yaml`
        steps:
        - script:
            title: Script Step
            content: Hello World
        - script:
            title: Script Step
            content: Another Script
        - deploy:
            title: Deploy Step
      `);

      YmlUtils.updateValueByPredicate(
        root,
        ['steps', '*', '*'],
        (node) => isMap(node) && node.get('content') === 'Hello World',
        { title: 'Updated Script', content: 'Updated Content' },
      );

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        steps:
        - script:
            title: Updated Script
            content: Updated Content
        - script:
            title: Script Step
            content: Another Script
        - deploy:
            title: Deploy Step
      `);
    });

    it('should not update anything if the predicate does not match', () => {
      const root = YmlUtils.toDoc(yaml`
        steps:
        - script:
            title: Script Step
        - deploy:
            title: Deploy Step
      `);

      YmlUtils.updateValueByPredicate(root, ['steps', '*', '*'], (node) => node === 'Not Exists', {});

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        steps:
        - script:
            title: Script Step
        - deploy:
            title: Deploy Step
      `);
    });

    it('should update multiple items matching a wildcard path', () => {
      const root = YmlUtils.toDoc(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Script Step
            - deploy:
                title: Deploy Step
          wf2:
            steps:
            - deploy:
                title: Deploy Step
            - clone:
                title: Clone Step
      `);

      YmlUtils.updateValueByPredicate(
        root,
        ['workflows', '*', 'steps', '*', '*'],
        (node) => isMap(node) && node.get('title') === 'Deploy Step',
        { title: 'New Deploy Step' },
      );

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        workflows:
          wf1:
            steps:
            - script:
                title: Script Step
            - deploy:
                title: New Deploy Step
          wf2:
            steps:
            - deploy:
                title: New Deploy Step
            - clone:
                title: Clone Step
      `);
    });

    it('should throw an error if the path does not exists in the root', () => {
      const root = YmlUtils.toDoc(yaml`workflows: {}`);

      expect(() =>
        YmlUtils.updateValueByPredicate(root, ['workflows', 'wf1', 'steps'], (node) => node === 'Not Exists', {}),
      ).toThrow('Node at path "workflows.wf1.steps" is not a YAML Node');
    });
  });

  describe('parse-error documents', () => {
    // Malformed YAML: yaml's Document.toString()/stringify() would otherwise throw
    // "Document with errors cannot be stringified".
    const INVALID_YML = 'workflows:\n  a:\n    steps:\n  - : : :\n\tbad_tab\n';

    it('toDoc parses malformed YAML into a document with errors (does not throw)', () => {
      const doc = YmlUtils.toDoc(INVALID_YML);
      expect(doc.errors.length).toBeGreaterThan(0);
    });

    it('toYml returns the raw source verbatim for a parse-error document instead of throwing', () => {
      const doc = YmlUtils.toDoc(INVALID_YML);
      expect(() => YmlUtils.toYml(doc)).not.toThrow();
      expect(YmlUtils.toYml(doc)).toBe(INVALID_YML);
    });

    it('toYml still serializes valid documents normally', () => {
      const doc = YmlUtils.toDoc(yaml`workflows: {}`);
      expect(YmlUtils.toYml(doc)).toBe(yaml`workflows: {}`);
    });

    it('isEquals does not throw when comparing against a parse-error document', () => {
      const invalid = YmlUtils.toDoc(INVALID_YML);
      const valid = YmlUtils.toDoc(yaml`workflows: {}`);
      expect(() => YmlUtils.isEquals(invalid, valid)).not.toThrow();
      expect(YmlUtils.isEquals(invalid, valid)).toBe(false);
      expect(YmlUtils.isEquals(invalid, YmlUtils.toDoc(INVALID_YML))).toBe(true);
    });
  });

  describe('unquoted values containing curly braces', () => {
    // Legacy configs carry unquoted step input values with braces in them. The YAML spec makes some
    // of those flow collections rather than strings, and others outright ambiguous. These cases pin
    // the behaviour to the raw/CLI parser (gopkg.in/yaml.v2, as used by the apiserver): every value
    // that parser accepts must parse here too, and vice versa — the visual editor must not be
    // stricter than the parser that runs the user's builds.
    const withInputValue = (value: string) =>
      [
        'workflows:',
        '  primary:',
        '    steps:',
        '    - deploy-to-bitrise-io@2:',
        '        inputs:',
        `        - notify_user_groups: ${value}`,
      ].join('\n');

    it.each([
      ['a brace group mid-scalar', 'reports/{devs,qa}', 'reports/{devs,qa}'],
      ['a brace group at the end of a scalar', './out/{devs,qa}', './out/{devs,qa}'],
      ['an escaped shell variable', '${FOO}', '${FOO}'],
      ['a quoted brace group', "'{devs,qa}'", '{devs,qa}'],
    ])('parses %s as a plain string', (_, value, expected) => {
      const doc = YmlUtils.toDoc(withInputValue(value));

      expect(doc.errors).toHaveLength(0);
      expect(YmlUtils.toJSON(doc)).toMatchObject({
        workflows: {
          primary: { steps: [{ 'deploy-to-bitrise-io@2': { inputs: [{ notify_user_groups: expected }] } }] },
        },
      });
    });

    it('parses a leading brace group as a flow map, without erroring', () => {
      // `{devs,qa}` is a well-formed flow mapping per the spec, so this is not a parse failure —
      // the raw/CLI parser accepts it too. It reaches the UI as a map, which is what `toInlineYml`
      // (and through it `StepVariableService.getValue`) has to render legibly.
      const doc = YmlUtils.toDoc(withInputValue('{devs,qa}'));

      expect(doc.errors).toHaveLength(0);
      expect(YmlUtils.toJSON(doc)).toMatchObject({
        workflows: {
          primary: {
            steps: [{ 'deploy-to-bitrise-io@2': { inputs: [{ notify_user_groups: { devs: null, qa: null } }] } }],
          },
        },
      });
    });

    it.each([
      ['a brace group followed by more scalar', '{devs,qa}/reports'],
      ['an unterminated brace group', '{devs,qa'],
      ['a doubled brace template', '{{ .Values.x }}'],
    ])('reports %s as a parse error rather than failing silently', (_, value) => {
      // These are genuinely ambiguous and the raw/CLI parser rejects them too, so the visual editor
      // must surface a located error instead of pretending the config loaded.
      const doc = YmlUtils.toDoc(withInputValue(value));
      const error = YmlUtils.parseErrorOf(doc);

      expect(doc.errors.length).toBeGreaterThan(0);
      expect(error?.message).toBeTruthy();
      expect(error?.line).toBe(6);
      expect(error?.column).toBeGreaterThan(0);
    });
  });

  describe('parseErrorOf', () => {
    it('returns undefined for a document that parsed cleanly', () => {
      expect(YmlUtils.parseErrorOf(YmlUtils.toDoc(yaml`workflows: {}`))).toBeUndefined();
    });

    it('reports the message, code and 1-based position of the first error', () => {
      const doc = YmlUtils.toDoc('format_version: "13"\nworkflows: {devs,qa}/reports\n');

      expect(YmlUtils.parseErrorOf(doc)).toEqual({
        message: 'Unexpected scalar at node end',
        code: 'UNEXPECTED_TOKEN',
        line: 2,
        column: 21,
        path: undefined,
      });
    });

    it('strips the code frame and the redundant position suffix from the library message', () => {
      const error = YmlUtils.parseErrorOf(YmlUtils.toDoc('a: {devs,qa}/reports'));

      expect(error?.message).not.toContain('\n');
      expect(error?.message).not.toMatch(/at line \d+/);
    });

    it('records the file the error came from when one is given', () => {
      const error = YmlUtils.parseErrorOf(YmlUtils.toDoc('a: {devs,qa}/reports'), 'ci/deploy.yml');

      expect(error?.path).toBe('ci/deploy.yml');
    });
  });

  describe('formatParseError', () => {
    it('renders line and column alongside the message', () => {
      expect(YmlUtils.formatParseError({ message: 'Unexpected scalar at node end', line: 7, column: 31 })).toBe(
        'Line 7, column 31: Unexpected scalar at node end',
      );
    });

    it('names the file first when the error came from a known module', () => {
      expect(
        YmlUtils.formatParseError({ message: 'Unexpected scalar at node end', line: 7, column: 31, path: 'ci/a.yml' }),
      ).toBe('ci/a.yml (line 7, column 31): Unexpected scalar at node end');
    });

    it('names the file alone when no position is known', () => {
      expect(YmlUtils.formatParseError({ message: 'Something went wrong', path: 'ci/a.yml' })).toBe(
        'ci/a.yml: Something went wrong',
      );
    });

    it('falls back to the bare message when no position is known', () => {
      expect(YmlUtils.formatParseError({ message: 'Something went wrong' })).toBe('Something went wrong');
    });

    it('returns an empty string when there is no error', () => {
      expect(YmlUtils.formatParseError(undefined)).toBe('');
    });
  });

  describe('toInlineYml', () => {
    it('renders a flow map from an unquoted brace value on a single line', () => {
      expect(YmlUtils.toInlineYml({ devs: null, qa: null })).toBe('{devs: null, qa: null}');
    });

    it('renders a sequence on a single line', () => {
      expect(YmlUtils.toInlineYml(['a', 'b'])).toBe('[a, b]');
    });

    it('renders nested collections without wrapping', () => {
      expect(YmlUtils.toInlineYml({ a: { b: 1 } })).toBe('{a: {b: 1}}');
    });

    it.each([['on'], ['off'], ['yes'], ['no'], ['y'], ['n']])(
      'quotes %s, which is a boolean in the YAML 1.1 schema the app serializes with',
      (key) => {
        expect(YmlUtils.toInlineYml({ [key]: null })).toBe(`{"${key}": null}`);
      },
    );

    it('quotes a numeric-looking key so it stays a string', () => {
      expect(YmlUtils.toInlineYml({ 2022: null })).toBe('{"2022": null}');
    });

    it('quotes keys the same way a save through toYml would write them', () => {
      // Both paths must agree on quoting, otherwise the field shows a form the app never writes.
      // Flow padding is the one deliberate difference — `toYml` preserves the source's spacing while
      // an inline field is always rendered compact — so it's normalised away here.
      const value = { on: null, devs: null };
      const inline = YmlUtils.toInlineYml(value);
      const saved = YmlUtils.toYml(YmlUtils.toDoc(`a: ${inline}`))
        .replace(/^a:\s*/, '')
        .trim();
      const ignoringPadding = (yml: string) => yml.replace(/\s+/g, '');

      expect(inline).toBe('{"on": null, devs: null}');
      expect(ignoringPadding(saved)).toBe(ignoringPadding(inline));
      expect(YmlUtils.toJSON(YmlUtils.toDoc(`a: ${saved}`))).toEqual({ a: value });
    });

    it.each([
      ['a string', 'reports/{devs,qa}', 'reports/{devs,qa}'],
      ['a number', 42, '42'],
      ['a boolean', false, 'false'],
      ['null', null, ''],
      ['undefined', undefined, ''],
    ])('renders %s unchanged', (_, value, expected) => {
      expect(YmlUtils.toInlineYml(value)).toBe(expected);
    });
  });
});
