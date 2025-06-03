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

    it('should keep scalar format when updating a value', () => {
      const root = YmlUtils.toDoc(yaml`
        title: Title
        summary: 'Summary'
        description: "Description"
        number_as_string: '123'
      `);

      YmlUtils.updateValueByPath(root, ['title'], 'New Title');
      YmlUtils.updateValueByPath(root, ['summary'], 'New Summary');
      YmlUtils.updateValueByPath(root, ['description'], 'New Description');
      YmlUtils.updateValueByPath(root, ['number_as_string'], '126');

      expect(YmlUtils.toYml(root)).toEqual(yaml`
        title: New Title
        summary: 'New Summary'
        description: "New Description"
        number_as_string: '126'
      `);
    });

    it('should throw an error if the path does not exists in the root', () => {
      const root = YmlUtils.toDoc(yaml`workflows: {}`);

      expect(() =>
        YmlUtils.updateValueByPath(root, ['workflows', 'wf1', 'steps', 0, 'script', 'title'], 'New Script Title'),
      ).toThrow('Node at path "workflows.wf1.steps.0.script.title" is not a YAML Node');
    });
  });

  describe('updaeValueByValue', () => {
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
});
