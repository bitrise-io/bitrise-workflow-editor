import { isMap, YAMLMap, YAMLSeq } from 'yaml';

import YmlUtils from './YmlUtils';

describe('YmlUtils', () => {
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

      const paths = YmlUtils.collectPaths(root, ['workflows', '*', 'steps', '*']);

      expect(paths).toEqual([
        ['workflows', 'wf2', 'steps', 0, 'deploy'],
        ['workflows', 'wf1', 'steps', 1, 'clone'],
        ['workflows', 'wf1', 'steps', 0, 'script'],
        ['workflows', '123', 'steps', 0, 'test'],
      ]);
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
});
