/**
 * @jest-environment jsdom
 */
import { datadogRum } from '@datadog/browser-rum';
import { act, renderHook } from '@testing-library/react';

import { recordToolSetupWrite } from '@/core/analytics/ToolSetupAnalytics';
import { ParsedToolVersion } from '@/core/models/Tools';
import { TreeNode } from '@/core/models/Tree';
import ToolsService, { ToolScope } from '@/core/services/ToolsService';
import {
  applyModularSaveResult,
  applySaveResult,
  discardBitriseYmlDocument,
  discardFile,
  forceRefreshStates,
  getFileYmlString,
  getYmlString,
  initializeBitriseYmlDocument,
  initializeModularConfig,
  selectNode,
  updateBitriseYmlDocumentByString,
  updateFileDocumentByString,
} from '@/core/stores/BitriseYmlStore';
import GlobalProps from '@/core/utils/GlobalProps';

import useTrackToolSetup from './useTrackToolSetup';

jest.mock('@datadog/browser-rum', () => ({ datadogRum: { addAction: jest.fn() } }));

const addAction = jest.mocked(datadogRum.addAction);

// Saves run back to back, and the store outlives each test, so every save needs its own `lastSavedAt`.
let now = 0;
jest.spyOn(Date, 'now').mockImplementation(() => (now += 1));

const ROOT: ToolScope = { type: 'root' };
const PRIMARY: ToolScope = { type: 'workflow', workflowId: 'primary' };

const load = (ymlString: string) => act(() => initializeBitriseYmlDocument({ ymlString, version: '1' }));
const editYaml = (ymlString: string) => act(() => updateBitriseYmlDocumentByString(ymlString));
const save = () => act(() => applySaveResult({ ymlString: getYmlString(), version: '2' }));

// What `ToolVersions` does for each write.
const setInUi = (toolId: string, parsed: ParsedToolVersion, scope: ToolScope = ROOT) =>
  act(() => {
    ToolsService.setTool(toolId, parsed, scope);
    recordToolSetupWrite(scope, [toolId]);
  });
const renameInUi = (oldId: string, newId: string, scope: ToolScope = ROOT) =>
  act(() => {
    ToolsService.renameTool(oldId, newId, scope);
    recordToolSetupWrite(scope, [oldId, newId]);
  });
const removeInUi = (toolId: string, scope: ToolScope = ROOT) =>
  act(() => {
    ToolsService.deleteTool(toolId, scope);
    recordToolSetupWrite(scope, [toolId]);
  });

const actions = () => addAction.mock.calls.map(([, context]) => context);

const mount = (ymlString = 'workflows:\n  primary: {}\n') => {
  renderHook(() => useTrackToolSetup());
  load(ymlString);
  addAction.mockClear();
};

describe('useTrackToolSetup', () => {
  beforeEach(() => {
    addAction.mockClear();
  });

  it('records a tool added in the UI, with its saved version', () => {
    mount();
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    save();

    expect(addAction).toHaveBeenCalledTimes(1);
    expect(addAction).toHaveBeenCalledWith('tool_setup_saved', {
      change: 'added',
      scope: 'root',
      tool: 'nodejs',
      strategy: 'exact',
      version: '22.1.0',
      viaUi: true,
    });
  });

  it('records only the saved value of a field typed into keystroke by keystroke', () => {
    mount();
    ['2', '22', '22.', '22.1'].forEach((version) => setInUi('nodejs', { strategy: 'exact', version }));
    save();

    expect(actions()).toEqual([expect.objectContaining({ change: 'added', version: '22.1', viaUi: true })]);
  });

  it('records a change made in YAML as not made in the UI', () => {
    mount();
    editYaml('tools:\n  ruby: "3.3:installed"\nworkflows:\n  primary: {}\n');
    save();

    expect(actions()).toEqual([
      {
        change: 'added',
        scope: 'root',
        tool: 'ruby',
        strategy: 'latest-of',
        version: '3.3',
        preferInstalled: true,
        viaUi: false,
      },
    ]);
  });

  it('records the previous strategy of an updated tool', () => {
    mount('tools:\n  nodejs: "22:latest"\nworkflows:\n  primary: {}\n');
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    save();

    expect(actions()).toEqual([
      expect.objectContaining({ change: 'updated', strategy: 'exact', previousStrategy: 'latest-of', viaUi: true }),
    ]);
  });

  it('records nothing when a save leaves the tools as they were', () => {
    mount();
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    removeInUi('nodejs');
    save();

    expect(addAction).not.toHaveBeenCalled();
  });

  it('credits the YAML editor when it changes a value the UI wrote', () => {
    mount();
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    editYaml('tools:\n  nodejs: 20.0.0\nworkflows:\n  primary: {}\n');
    save();

    expect(actions()).toEqual([expect.objectContaining({ version: '20.0.0', viaUi: false })]);
  });

  it('records a rename in the UI as one tool removed and another added', () => {
    mount('workflows:\n  primary:\n    tools:\n      node: latest\n');
    renameInUi('node', 'nodejs', PRIMARY);
    save();

    expect(actions()).toEqual([
      expect.objectContaining({ change: 'removed', scope: 'workflow', tool: 'node', viaUi: true }),
      expect.objectContaining({ change: 'added', scope: 'workflow', tool: 'nodejs', viaUi: true }),
    ]);
  });

  it('ignores tools that a workflow rename carries along', () => {
    mount('workflows:\n  primary:\n    tools:\n      nodejs: latest\n');
    editYaml('workflows:\n  renamed:\n    tools:\n      nodejs: latest\n');
    save();

    expect(addAction).not.toHaveBeenCalled();
  });

  it('records tools set up in the UI for a workflow the save creates', () => {
    mount();
    editYaml('workflows:\n  primary: {}\n  deploy: {}\n');
    setInUi('nodejs', { strategy: 'absolute-latest-released' }, { type: 'workflow', workflowId: 'deploy' });
    save();

    expect(actions()).toEqual([
      expect.objectContaining({
        change: 'added',
        scope: 'workflow',
        strategy: 'absolute-latest-released',
        viaUi: true,
      }),
    ]);
  });

  it('forgets UI writes when a config loads', () => {
    mount();
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    load('workflows:\n  primary: {}\n');
    editYaml('tools:\n  nodejs: 22.1.0\nworkflows:\n  primary: {}\n');
    save();

    expect(actions()).toEqual([expect.objectContaining({ viaUi: false })]);
  });

  it('forgets UI writes when the changes are discarded', () => {
    mount();
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    act(() => discardBitriseYmlDocument());
    editYaml('tools:\n  nodejs: 22.1.0\nworkflows:\n  primary: {}\n');
    save();

    expect(actions()).toEqual([expect.objectContaining({ viaUi: false })]);
  });

  it('keeps UI writes when an edit applied in the diff dialog leaves them alone', () => {
    mount();
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    editYaml(`project_type: ios\n${getYmlString()}`);
    act(() => forceRefreshStates());
    save();

    expect(actions()).toEqual([expect.objectContaining({ tool: 'nodejs', viaUi: true })]);
  });

  it('sends the workspace when there is one', () => {
    mount();
    jest.spyOn(GlobalProps, 'workspaceSlug').mockReturnValueOnce('workspace-slug');
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    save();

    expect(actions()).toEqual([expect.objectContaining({ workspaceSlug: 'workspace-slug' })]);
  });

  describe('modular config', () => {
    const node = (nodeId: string, contents: string, includes: TreeNode[] = []): TreeNode => ({
      nodeId,
      path: `${nodeId}.yml`,
      contents,
      source: null,
      commitSha: 'sha',
      editable: true,
      includes,
    });

    const saveModular = () =>
      act(() =>
        applyModularSaveResult({
          root: node('root', getFileYmlString('root'), [node('module', getFileYmlString('module'))]),
        }),
      );

    it('tells the same tool in two files apart', () => {
      const tools = 'tools:\n  nodejs: latest\n';
      renderHook(() => useTrackToolSetup());
      act(() => initializeModularConfig({ root: node('root', tools, [node('module', tools)]), mergedYml: tools }));
      act(() => selectNode('module'));
      setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
      act(() => selectNode('root'));
      act(() => updateBitriseYmlDocumentByString('tools:\n  nodejs: 20.0.0\n'));
      saveModular();

      expect(actions()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ version: '22.1.0', viaUi: true }),
          expect.objectContaining({ version: '20.0.0', viaUi: false }),
        ]),
      );
      expect(addAction).toHaveBeenCalledTimes(2);
    });

    it('forgets only the UI writes of a discarded file', () => {
      renderHook(() => useTrackToolSetup());
      act(() => initializeModularConfig({ root: node('root', '{}\n', [node('module', '{}\n')]), mergedYml: '{}\n' }));
      act(() => selectNode('root'));
      setInUi('ruby', { strategy: 'exact', version: '3.3.0' });
      act(() => selectNode('module'));
      setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
      act(() => discardFile('module'));
      act(() => updateFileDocumentByString('module', 'tools:\n  nodejs: 22.1.0\n'));
      saveModular();

      expect(actions()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ tool: 'ruby', viaUi: true }),
          expect.objectContaining({ tool: 'nodejs', viaUi: false }),
        ]),
      );
      expect(addAction).toHaveBeenCalledTimes(2);
    });
  });
});
