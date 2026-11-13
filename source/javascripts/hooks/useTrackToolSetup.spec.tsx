/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { recordToolSetupWrite } from '@/core/analytics/ToolSetupAnalytics';
import { ParsedToolVersion } from '@/core/models/Tools';
import { TreeNode } from '@/core/models/Tree';
import ToolsService, { ToolScope } from '@/core/services/ToolsService';
import {
  applyModularSaveResult,
  applySaveResult,
  getFileYmlString,
  getYmlString,
  initializeBitriseYmlDocument,
  initializeModularConfig,
  selectNode,
  updateBitriseYmlDocumentByString,
  updateFileDocumentByString,
} from '@/core/stores/BitriseYmlStore';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

import useTrackToolSetup from './useTrackToolSetup';

// The real module reads `window.env` on load, which Jest doesn't have.
jest.mock('@/core/analytics/SegmentBaseTracking', () => ({ segmentTrack: jest.fn() }));

const track = jest.mocked(segmentTrack);
jest.spyOn(RuntimeUtils, 'isWebsiteMode').mockReturnValue(true);

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

const events = () => track.mock.calls.map(([, properties]) => properties);

const mount = (ymlString = 'workflows:\n  primary: {}\n') => {
  renderHook(() => useTrackToolSetup());
  load(ymlString);
  track.mockClear();
};

describe('useTrackToolSetup', () => {
  beforeEach(() => {
    track.mockClear();
  });

  it('records a tool added in the UI, with its saved version', () => {
    mount();
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    save();

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('Tool Setup Changed', {
      event_type: 'product',
      tool_setup_save_id: expect.any(String),
      tool_change_type: 'added',
      tool_scope: 'root',
      tool_id: 'nodejs',
      tool_version_strategy: 'exact',
      tool_version: '22.1.0',
      tool_edit_method: 'ui',
    });
  });

  it('records only the saved value of a field typed into keystroke by keystroke', () => {
    mount();
    ['2', '22', '22.', '22.1'].forEach((version) => setInUi('nodejs', { strategy: 'exact', version }));
    save();

    expect(events()).toEqual([
      expect.objectContaining({ tool_change_type: 'added', tool_version: '22.1', tool_edit_method: 'ui' }),
    ]);
  });

  it('records a change made in YAML as not made in the UI', () => {
    mount();
    editYaml('tools:\n  ruby: "3.3:installed"\nworkflows:\n  primary: {}\n');
    save();

    expect(events()).toEqual([
      {
        event_type: 'product',
        tool_setup_save_id: expect.any(String),
        tool_change_type: 'added',
        tool_scope: 'root',
        tool_id: 'ruby',
        tool_version_strategy: 'latest_of',
        tool_version: '3.3',
        is_installed_version_preferred: true,
        tool_edit_method: 'yaml_editor',
      },
    ]);
  });

  it('records what an update changed, leaving out the preference when one side has none', () => {
    mount('tools:\n  nodejs: "22:latest"\nworkflows:\n  primary: {}\n');
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    save();

    expect(events()).toEqual([
      expect.objectContaining({
        tool_change_type: 'updated',
        tool_version_strategy: 'exact',
        previous_tool_version_strategy: 'latest_of',
        is_tool_version_strategy_changed: true,
        is_tool_version_changed: true,
        tool_edit_method: 'ui',
      }),
    ]);
    expect(events()[0]).not.toHaveProperty('is_installed_version_preference_changed');
  });

  it('records a new strategy with the same version as the version unchanged', () => {
    mount('tools:\n  golang: 1.23.0\nworkflows:\n  primary: {}\n');
    setInUi('golang', { strategy: 'latest-of', prefix: '1.23.0', preferInstalled: false });
    save();

    expect(events()).toEqual([
      expect.objectContaining({
        tool_change_type: 'updated',
        is_tool_version_strategy_changed: true,
        is_tool_version_changed: false,
      }),
    ]);
  });

  it('records nothing for a YAML edit that reads the same', () => {
    mount('tools:\n  nodejs: "22:latest"\nworkflows:\n  primary: {}\n');
    editYaml('tools:\n  nodejs: "22:Latest "\nworkflows:\n  primary: {}\n');
    save();

    expect(track).not.toHaveBeenCalled();
  });

  it('records a changed preference on its own when the prefix stays', () => {
    mount('tools:\n  nodejs: "22:latest"\nworkflows:\n  primary: {}\n');
    setInUi('nodejs', { strategy: 'latest-of', prefix: '22', preferInstalled: true });
    save();

    expect(events()).toEqual([
      expect.objectContaining({
        tool_change_type: 'updated',
        is_tool_version_strategy_changed: false,
        is_tool_version_changed: false,
        is_installed_version_preference_changed: true,
      }),
    ]);
  });

  it('records nothing for a tool entry that holds a map instead of a version', () => {
    mount();
    editYaml(
      'defaults: &defaults\n  ruby: 3.3.0\ntools:\n  <<: *defaults\n  nodejs:\n    version: 22\nworkflows:\n  primary: {}\n',
    );
    save();

    expect(events()).toEqual([]);
  });

  it('records a removed tool with the version it had, and no update flags', () => {
    mount('tools:\n  nodejs: "22:latest"\nworkflows:\n  primary: {}\n');
    removeInUi('nodejs');
    setInUi('ruby', { strategy: 'latest-of', prefix: '3.3', preferInstalled: false });
    save();

    expect(events()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tool_change_type: 'removed',
          tool_id: 'nodejs',
          tool_version_strategy: 'latest_of',
          tool_version: '22',
          is_installed_version_preferred: false,
        }),
      ]),
    );
    events().forEach((event) => {
      expect(event).not.toHaveProperty('previous_tool_version_strategy');
      expect(event).not.toHaveProperty('is_tool_version_changed');
      expect(event).not.toHaveProperty('is_tool_version_strategy_changed');
      expect(event).not.toHaveProperty('is_installed_version_preference_changed');
    });
    expect(track).toHaveBeenCalledTimes(2);
  });

  it('gives every event of one save the same save id, and the next save another', () => {
    mount();
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    setInUi('ruby', { strategy: 'exact', version: '3.3.0' });
    save();
    setInUi('golang', { strategy: 'exact', version: '1.23.0' });
    save();

    const [first, second, third] = events().map((event) => event?.tool_setup_save_id);
    expect(first).toEqual(expect.any(String));
    expect(second).toBe(first);
    expect(third).not.toBe(first);
  });

  it('records nothing for a tool a save leaves as it was', () => {
    mount();
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    removeInUi('nodejs');
    setInUi('ruby', { strategy: 'exact', version: '3.3.0' });
    save();

    expect(events()).toEqual([expect.objectContaining({ tool_id: 'ruby' })]);
  });

  it('credits the YAML editor when it changes a value the UI wrote', () => {
    mount();
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    editYaml('tools:\n  nodejs: 20.0.0\nworkflows:\n  primary: {}\n');
    save();

    expect(events()).toEqual([expect.objectContaining({ tool_version: '20.0.0', tool_edit_method: 'yaml_editor' })]);
  });

  it('records a rename in the UI as one tool removed and another added', () => {
    mount('workflows:\n  primary:\n    tools:\n      node: latest\n');
    renameInUi('node', 'nodejs', PRIMARY);
    save();

    expect(events()).toEqual([
      expect.objectContaining({
        tool_change_type: 'removed',
        tool_scope: 'workflow',
        tool_id: 'node',
        tool_edit_method: 'ui',
      }),
      expect.objectContaining({
        tool_change_type: 'added',
        tool_scope: 'workflow',
        tool_id: 'nodejs',
        tool_edit_method: 'ui',
      }),
    ]);
  });

  it('ignores tools that a workflow rename carries along', () => {
    mount('workflows:\n  primary:\n    tools:\n      nodejs: latest\n');
    editYaml('tools:\n  ruby: 3.3.0\nworkflows:\n  renamed:\n    tools:\n      nodejs: latest\n');
    save();

    expect(events()).toEqual([
      expect.objectContaining({ tool_change_type: 'added', tool_scope: 'root', tool_id: 'ruby' }),
    ]);
  });

  it('records tools set up in the UI for a workflow the save creates', () => {
    mount();
    editYaml('workflows:\n  primary: {}\n  deploy: {}\n');
    setInUi('nodejs', { strategy: 'absolute-latest-released' }, { type: 'workflow', workflowId: 'deploy' });
    save();

    expect(events()).toEqual([
      expect.objectContaining({
        tool_change_type: 'added',
        tool_scope: 'workflow',
        tool_version_strategy: 'latest_released',
        tool_edit_method: 'ui',
      }),
    ]);
  });

  it('forgets UI writes when a config loads', () => {
    mount();
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    load('workflows:\n  primary: {}\n');
    editYaml('tools:\n  nodejs: 22.1.0\nworkflows:\n  primary: {}\n');
    save();

    expect(events()).toEqual([expect.objectContaining({ tool_edit_method: 'yaml_editor' })]);
  });

  it('ignores tools that were already there when a config that failed to parse is fixed', () => {
    mount('tools:\n  nodejs: 22.1.0\nworkflows: [\n');
    editYaml('tools:\n  nodejs: 22.1.0\nworkflows:\n  primary: {}\n');
    setInUi('ruby', { strategy: 'exact', version: '3.3.0' });
    save();

    expect(events()).toEqual([expect.objectContaining({ tool_id: 'ruby', tool_edit_method: 'ui' })]);
  });

  it('forgets UI writes when a config that fails to parse loads over another one', () => {
    mount('workflows: [\n');
    editYaml('workflows:\n  primary: {}\n');
    setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
    load('tools:\n  nodejs: 22.1.0\nworkflows: [\n');
    editYaml('tools:\n  nodejs: 22.1.0\nworkflows:\n  primary: {}\n');
    setInUi('ruby', { strategy: 'exact', version: '3.3.0' });
    save();

    expect(events()).toEqual([expect.objectContaining({ tool_id: 'ruby', tool_edit_method: 'ui' })]);
  });

  it('records tools added in YAML to a config that started empty', () => {
    mount('');
    editYaml('tools:\n  nodejs: 22.1.0\n');
    save();

    expect(events()).toEqual([
      expect.objectContaining({ tool_change_type: 'added', tool_id: 'nodejs', tool_edit_method: 'yaml_editor' }),
    ]);
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

    const mountModular = (root: TreeNode) => {
      renderHook(() => useTrackToolSetup());
      act(() => initializeModularConfig({ root, mergedYml: '{}\n' }));
    };

    const BROKEN_MODULE = 'tools:\n  nodejs: 22.1.0\nworkflows: *missing\n';

    const saveModular = (moduleContents = getFileYmlString('module')) =>
      act(() =>
        applyModularSaveResult({ root: node('root', getFileYmlString('root'), [node('module', moduleContents)]) }),
      );

    it('tells the same tool in two files apart', () => {
      const tools = 'tools:\n  nodejs: latest\n';
      mountModular(node('root', tools, [node('module', tools)]));
      act(() => selectNode('module'));
      setInUi('nodejs', { strategy: 'exact', version: '22.1.0' });
      act(() => selectNode('root'));
      act(() => updateBitriseYmlDocumentByString('tools:\n  nodejs: 20.0.0\n'));
      saveModular();

      expect(events()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ tool_version: '22.1.0', tool_edit_method: 'ui' }),
          expect.objectContaining({ tool_version: '20.0.0', tool_edit_method: 'yaml_editor' }),
        ]),
      );
      expect(track).toHaveBeenCalledTimes(2);
    });

    it('ignores tools that were already there when a module that failed to parse is fixed', () => {
      mountModular(node('root', '{}\n', [node('module', BROKEN_MODULE)]));
      act(() => updateFileDocumentByString('module', 'tools:\n  nodejs: 22.1.0\n'));
      act(() => selectNode('root'));
      setInUi('ruby', { strategy: 'exact', version: '3.3.0' });
      saveModular();

      expect(events()).toEqual([expect.objectContaining({ tool_id: 'ruby', tool_edit_method: 'ui' })]);
    });

    it('keeps saving while a module has more aliases than the YAML library resolves', () => {
      const manyAliases = `x: &x [1]\n${Array.from({ length: 101 }, (_, i) => `k${i}: *x\n`).join('')}`;
      mountModular(node('root', '{}\n', [node('module', manyAliases)]));
      act(() => selectNode('root'));
      setInUi('ruby', { strategy: 'exact', version: '3.3.0' });
      saveModular(manyAliases);

      expect(events()).toEqual([expect.objectContaining({ tool_id: 'ruby', tool_edit_method: 'ui' })]);
    });
  });
});
