import ToolsService from '@/core/services/ToolsService';

import { ToolVersions } from '../models/Tools';
import { getYmlString, updateBitriseYmlDocumentByString } from '../stores/BitriseYmlStore';

function versionCatalog(toolId: string, versions: string[], isSemver = true): ToolVersions {
  return { toolId, versions: versions.map((version) => ({ version, isSemver })) };
}

describe('ToolsService', () => {
  describe('parseToolVersion', () => {
    it('parses "latest" as latest-released without prefix', () => {
      expect(ToolsService.parseToolVersion('latest')).toEqual({ strategy: 'latest-released' });
    });

    it('parses "<prefix>:latest" as latest-released with prefix', () => {
      expect(ToolsService.parseToolVersion('22:latest')).toEqual({ strategy: 'latest-released', prefix: '22' });
      expect(ToolsService.parseToolVersion('3.3:latest')).toEqual({ strategy: 'latest-released', prefix: '3.3' });
    });

    it('parses "<prefix>:installed" as latest-installed', () => {
      expect(ToolsService.parseToolVersion('3.3:installed')).toEqual({ strategy: 'latest-installed', prefix: '3.3' });
    });

    it('parses bare "installed" as latest-installed without prefix', () => {
      expect(ToolsService.parseToolVersion('installed')).toEqual({ strategy: 'latest-installed' });
    });

    it('parses bare partial versions as exact', () => {
      expect(ToolsService.parseToolVersion('3')).toEqual({ strategy: 'exact', version: '3' });
      expect(ToolsService.parseToolVersion('3.3')).toEqual({ strategy: 'exact', version: '3.3' });
      expect(ToolsService.parseToolVersion('3.3.x')).toEqual({ strategy: 'exact', version: '3.3.x' });
      expect(ToolsService.parseToolVersion('3.x.x')).toEqual({ strategy: 'exact', version: '3.x.x' });
    });

    it('parses a bare complete semver triple as exact', () => {
      expect(ToolsService.parseToolVersion('3.13.4')).toEqual({ strategy: 'exact', version: '3.13.4' });
    });

    it('parses "unset"', () => {
      expect(ToolsService.parseToolVersion('unset')).toEqual({ strategy: 'unset' });
    });

    it('parses an empty string as exact with empty version', () => {
      expect(ToolsService.parseToolVersion('')).toEqual({ strategy: 'exact', version: '' });
    });

    it('parses a malformed value with unknown suffix as exact', () => {
      expect(ToolsService.parseToolVersion('foo:bar')).toEqual({ strategy: 'exact', version: 'foo:bar' });
    });

    it('parses a leading-colon value as exact', () => {
      expect(ToolsService.parseToolVersion(':latest')).toEqual({ strategy: 'exact', version: ':latest' });
    });

    it('parses keywords case-insensitively', () => {
      expect(ToolsService.parseToolVersion('Latest')).toEqual({ strategy: 'latest-released' });
      expect(ToolsService.parseToolVersion('LATEST')).toEqual({ strategy: 'latest-released' });
      expect(ToolsService.parseToolVersion('Installed')).toEqual({ strategy: 'latest-installed' });
      expect(ToolsService.parseToolVersion('INSTALLED')).toEqual({ strategy: 'latest-installed' });
      expect(ToolsService.parseToolVersion('Unset')).toEqual({ strategy: 'unset' });
      expect(ToolsService.parseToolVersion('22:Latest')).toEqual({ strategy: 'latest-released', prefix: '22' });
      expect(ToolsService.parseToolVersion('3.3:INSTALLED')).toEqual({ strategy: 'latest-installed', prefix: '3.3' });
    });
  });

  describe('getKnownToolIds', () => {
    it('returns an empty array when there is no catalog', () => {
      expect(ToolsService.getKnownToolIds(undefined)).toEqual([]);
    });

    it('includes canonical names and aliases', () => {
      const catalog = {
        tools: [{ name: 'golang', aliases: ['go'] }, { name: 'nodejs', aliases: ['node'] }, { name: 'ruby' }],
      };

      expect(ToolsService.getKnownToolIds(catalog)).toEqual(['golang', 'go', 'nodejs', 'node', 'ruby']);
    });
  });

  describe('isKnownToolId', () => {
    const catalog = { tools: [{ name: 'golang', aliases: ['go'] }] };

    it('matches a canonical name', () => {
      expect(ToolsService.isKnownToolId(catalog, 'golang')).toBe(true);
    });

    it('matches an alias', () => {
      expect(ToolsService.isKnownToolId(catalog, 'go')).toBe(true);
    });

    it('rejects an unknown id', () => {
      expect(ToolsService.isKnownToolId(catalog, 'rustc')).toBe(false);
    });

    it('rejects when there is no catalog', () => {
      expect(ToolsService.isKnownToolId(undefined, 'golang')).toBe(false);
    });
  });

  describe('getVersionOptions', () => {
    it('sorts semver versions newest first', () => {
      const catalog = versionCatalog('nodejs', ['22.4.1', '24.0.0', '22.11.0']);

      expect(ToolsService.getVersionOptions(catalog, '')).toEqual([
        { value: '24.0.0', label: '24.0.0' },
        { value: '22.11.0', label: '22.11.0' },
        { value: '22.4.1', label: '22.4.1' },
      ]);
    });

    it('appends non-semver versions after semver ones, in catalog order', () => {
      const catalog: ToolVersions = {
        toolId: 'nodejs',
        versions: [
          { version: 'lts-iron', isSemver: false },
          { version: '22.4.1', isSemver: true },
          { version: '24.0.0', isSemver: true },
          { version: 'nightly', isSemver: false },
        ],
      };

      expect(ToolsService.getVersionOptions(catalog, '').map(({ value }) => value)).toEqual([
        '24.0.0',
        '22.4.1',
        'lts-iron',
        'nightly',
      ]);
    });

    it('injects a current version missing from the catalog at the top', () => {
      const catalog = versionCatalog('nodejs', ['24.0.0']);

      expect(ToolsService.getVersionOptions(catalog, '18.9.9').map(({ value }) => value)).toEqual(['18.9.9', '24.0.0']);
    });

    it('does not duplicate a current version that is already in the catalog', () => {
      const catalog = versionCatalog('nodejs', ['24.0.0', '22.4.1']);

      expect(ToolsService.getVersionOptions(catalog, '22.4.1').map(({ value }) => value)).toEqual(['24.0.0', '22.4.1']);
    });

    it('ignores an empty current version', () => {
      expect(ToolsService.getVersionOptions(versionCatalog('nodejs', ['24.0.0']), '')).toEqual([
        { value: '24.0.0', label: '24.0.0' },
      ]);
    });

    it('returns only the current version when the catalog is undefined', () => {
      expect(ToolsService.getVersionOptions(undefined, '18.9.9')).toEqual([{ value: '18.9.9', label: '18.9.9' }]);
      expect(ToolsService.getVersionOptions(undefined, '')).toEqual([]);
    });

    it('handles a tool whose published version list is empty', () => {
      const catalog = versionCatalog('nodejs', []);

      expect(ToolsService.getVersionOptions(catalog, '')).toEqual([]);
      expect(ToolsService.getVersionOptions(catalog, '18.9.9')).toEqual([{ value: '18.9.9', label: '18.9.9' }]);
    });
  });

  describe('isVersionInCatalog', () => {
    const catalog = versionCatalog('nodejs', ['24.0.0', '22.4.1']);

    it('finds a version present in the catalog', () => {
      expect(ToolsService.isVersionInCatalog(catalog, '22.4.1')).toBe(true);
    });

    it('rejects a version missing from the catalog', () => {
      expect(ToolsService.isVersionInCatalog(catalog, '18.9.9')).toBe(false);
    });

    it('rejects when the catalog is undefined', () => {
      expect(ToolsService.isVersionInCatalog(undefined, '24.0.0')).toBe(false);
    });
  });

  describe('nextVersionOnStrategyChange', () => {
    it('keeps the prefix when moving between the two prefix strategies', () => {
      expect(ToolsService.nextVersionOnStrategyChange('latest-released', 'latest-installed', '22')).toBe('22');
      expect(ToolsService.nextVersionOnStrategyChange('latest-installed', 'latest-released', '3.3')).toBe('3.3');
    });

    it('clears the value when switching from exact to a prefix strategy', () => {
      expect(ToolsService.nextVersionOnStrategyChange('exact', 'latest-released', '22.4.1')).toBe('');
    });

    it('clears the value when switching from a prefix strategy to exact', () => {
      expect(ToolsService.nextVersionOnStrategyChange('latest-released', 'exact', '22')).toBe('');
    });

    it('clears the value when switching to unset', () => {
      expect(ToolsService.nextVersionOnStrategyChange('exact', 'unset', '22.4.1')).toBe('');
      expect(ToolsService.nextVersionOnStrategyChange('latest-released', 'unset', '22')).toBe('');
    });
  });

  describe('getToolIdOptions', () => {
    const catalog = {
      tools: [{ name: 'golang', aliases: ['go'] }, { name: 'nodejs', aliases: ['node'] }, { name: 'ruby' }],
    };

    it('lists each tool by its canonical name', () => {
      expect(ToolsService.getToolIdOptions(catalog, '')).toEqual([
        { value: 'golang', label: 'golang' },
        { value: 'nodejs', label: 'nodejs' },
        { value: 'ruby', label: 'ruby' },
      ]);
    });

    it('shows the current alias instead of the canonical name for the matching tool', () => {
      expect(ToolsService.getToolIdOptions(catalog, 'go')).toEqual([
        { value: 'go', label: 'go' },
        { value: 'nodejs', label: 'nodejs' },
        { value: 'ruby', label: 'ruby' },
      ]);
    });

    it('returns an empty array when there is no catalog', () => {
      expect(ToolsService.getToolIdOptions(undefined, 'go')).toEqual([]);
    });
  });

  describe('getAvailableToolIdOptions', () => {
    const catalog = {
      tools: [{ name: 'golang', aliases: ['go'] }, { name: 'nodejs', aliases: ['node'] }, { name: 'ruby' }],
    };

    it('excludes tool IDs already used by another row', () => {
      expect(ToolsService.getAvailableToolIdOptions(catalog, 'go', ['go', 'ruby'])).toEqual([
        { value: 'go', label: 'go' },
        { value: 'nodejs', label: 'nodejs' },
      ]);
    });

    it('keeps the current row value even if it is also in existingToolIds', () => {
      expect(ToolsService.getAvailableToolIdOptions(catalog, 'ruby', ['ruby'])).toEqual([
        { value: 'golang', label: 'golang' },
        { value: 'nodejs', label: 'nodejs' },
        { value: 'ruby', label: 'ruby' },
      ]);
    });

    it('returns an empty array when there is no catalog', () => {
      expect(ToolsService.getAvailableToolIdOptions(undefined, 'go', [])).toEqual([]);
    });

    it('excludes the canonical name when an alias is already pinned by another row', () => {
      expect(ToolsService.getAvailableToolIdOptions(catalog, '', ['go'])).toEqual([
        { value: 'nodejs', label: 'nodejs' },
        { value: 'ruby', label: 'ruby' },
      ]);
    });

    it('excludes an alias when the canonical name is already pinned by another row', () => {
      expect(ToolsService.getAvailableToolIdOptions(catalog, '', ['golang'])).toEqual([
        { value: 'nodejs', label: 'nodejs' },
        { value: 'ruby', label: 'ruby' },
      ]);
    });
  });

  describe('validateToolId', () => {
    it('rejects empty and whitespace-only IDs', () => {
      expect(ToolsService.validateToolId('', '')).toBe('Tool ID is required');
      expect(ToolsService.validateToolId('   ', '')).toBe('Tool ID is required');
    });

    it('rejects duplicate IDs', () => {
      expect(ToolsService.validateToolId('node', '', ['node', 'python'])).toBe('Tool ID must be unique');
    });

    it('accepts a fresh ID', () => {
      expect(ToolsService.validateToolId('ruby', '', ['node', 'python'])).toBe(true);
    });

    it('accepts re-using the original ID when renaming', () => {
      expect(ToolsService.validateToolId('node', 'node', ['node', 'python'])).toBe(true);
    });

    it('rejects an alias when the canonical name is already pinned by another row', () => {
      const catalog = { tools: [{ name: 'golang', aliases: ['go'] }] };
      expect(ToolsService.validateToolId('go', '', ['golang'], catalog)).toBe('Tool ID must be unique');
    });

    it('rejects the canonical name when an alias is already pinned by another row', () => {
      const catalog = { tools: [{ name: 'golang', aliases: ['go'] }] };
      expect(ToolsService.validateToolId('golang', '', ['go'], catalog)).toBe('Tool ID must be unique');
    });
  });

  describe('setTool', () => {
    it('throws when using "unset" strategy at root scope', () => {
      expect(() => ToolsService.setTool('node', 'unset', '', { type: 'root' })).toThrow();
    });

    describe('root-level', () => {
      it('creates the tools block when absent', () => {
        updateBitriseYmlDocumentByString(yaml`format_version: '13'`);

        ToolsService.setTool('node', 'latest-released', '22', { type: 'root' });

        expect(getYmlString()).toEqual(yaml`
          format_version: '13'
          tools:
            node: 22:latest
        `);
      });

      it('adds an entry to an existing tools block', () => {
        updateBitriseYmlDocumentByString(yaml`
          tools:
            node: 22:latest
        `);

        ToolsService.setTool('python', 'exact', '3.13.4', { type: 'root' });

        expect(getYmlString()).toEqual(yaml`
          tools:
            node: 22:latest
            python: "3.13.4"
        `);
      });

      it('updates an existing tool entry', () => {
        updateBitriseYmlDocumentByString(yaml`
          tools:
            node: 22:latest
            python: "3.13.4"
        `);

        ToolsService.setTool('node', 'latest-released', '', { type: 'root' });

        expect(getYmlString()).toEqual(yaml`
          tools:
            node: latest
            python: "3.13.4"
        `);
      });

      it('sets latest-installed with prefix', () => {
        updateBitriseYmlDocumentByString(yaml`format_version: '13'`);

        ToolsService.setTool('ruby', 'latest-installed', '3.3', { type: 'root' });

        expect(getYmlString()).toEqual(yaml`
          format_version: '13'
          tools:
            ruby: 3.3:installed
        `);
      });

      it('sets latest-installed without prefix', () => {
        updateBitriseYmlDocumentByString(yaml`format_version: '13'`);

        ToolsService.setTool('ruby', 'latest-installed', '', { type: 'root' });

        expect(getYmlString()).toEqual(yaml`
          format_version: '13'
          tools:
            ruby: installed
        `);
      });
    });

    describe('workflow-level', () => {
      it('creates the workflow tools block when absent', () => {
        updateBitriseYmlDocumentByString(yaml`
          workflows:
            primary:
              steps: []
        `);

        ToolsService.setTool('node', 'latest-released', '22', { type: 'workflow', workflowId: 'primary' });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            primary:
              steps: []
              tools:
                node: 22:latest
        `);
      });

      it('adds an entry to an existing workflow tools block', () => {
        updateBitriseYmlDocumentByString(yaml`
          workflows:
            primary:
              tools:
                node: 22:latest
        `);

        ToolsService.setTool('python', 'exact', '3.13.4', { type: 'workflow', workflowId: 'primary' });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            primary:
              tools:
                node: 22:latest
                python: "3.13.4"
        `);
      });

      it('updates an existing workflow tool entry', () => {
        updateBitriseYmlDocumentByString(yaml`
          workflows:
            primary:
              tools:
                node: 22:latest
        `);

        ToolsService.setTool('node', 'unset', '', { type: 'workflow', workflowId: 'primary' });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            primary:
              tools:
                node: unset
        `);
      });

      it('does not touch sibling workflows', () => {
        updateBitriseYmlDocumentByString(yaml`
          workflows:
            primary:
              tools:
                node: 22:latest
            secondary:
              steps: []
        `);

        ToolsService.setTool('python', 'exact', '3.13.4', { type: 'workflow', workflowId: 'secondary' });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            primary:
              tools:
                node: 22:latest
            secondary:
              steps: []
              tools:
                python: "3.13.4"
        `);
      });

      it('throws when workflow does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`format_version: '13'`);

        expect(() =>
          ToolsService.setTool('node', 'latest-released', '', { type: 'workflow', workflowId: 'missing' }),
        ).toThrow();
      });
    });
  });

  describe('deleteTool', () => {
    describe('root-level', () => {
      it('removes an entry but keeps the block when others remain', () => {
        updateBitriseYmlDocumentByString(yaml`
          tools:
            node: 22:latest
            python: "3.13.4"
        `);

        ToolsService.deleteTool('node', { type: 'root' });

        expect(getYmlString()).toEqual(yaml`
          tools:
            python: "3.13.4"
        `);
      });

      it('removes the empty tools block when deleting the last entry', () => {
        updateBitriseYmlDocumentByString(yaml`
          format_version: '13'
          tools:
            node: 22:latest
        `);

        ToolsService.deleteTool('node', { type: 'root' });

        expect(getYmlString()).toEqual(yaml`format_version: '13'`);
      });
    });

    describe('workflow-level', () => {
      it('removes an entry but keeps the block when others remain', () => {
        updateBitriseYmlDocumentByString(yaml`
          workflows:
            primary:
              tools:
                node: 22:latest
                python: "3.13.4"
        `);

        ToolsService.deleteTool('node', { type: 'workflow', workflowId: 'primary' });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            primary:
              tools:
                python: "3.13.4"
        `);
      });

      it('removes the empty tools block but keeps the workflow when deleting the last entry', () => {
        updateBitriseYmlDocumentByString(yaml`
          workflows:
            primary:
              steps: []
              tools:
                node: 22:latest
        `);

        ToolsService.deleteTool('node', { type: 'workflow', workflowId: 'primary' });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            primary:
              steps: []
        `);
      });

      it('throws when workflow does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`format_version: '13'`);

        expect(() => ToolsService.deleteTool('node', { type: 'workflow', workflowId: 'missing' })).toThrow();
      });
    });
  });

  describe('renameTool', () => {
    describe('root-level', () => {
      it('renames the entry in place, keeping sibling order and dropping the stale prefix', () => {
        updateBitriseYmlDocumentByString(yaml`
          tools:
            node: 22:latest
            python: "3.13.4"
        `);

        ToolsService.renameTool('node', 'ruby', { type: 'root' });

        expect(getYmlString()).toEqual(yaml`
          tools:
            ruby: latest
            python: "3.13.4"
        `);
      });

      it('clears an exact version, keeping the exact strategy', () => {
        updateBitriseYmlDocumentByString(yaml`
          tools:
            python: "3.13.4"
        `);

        ToolsService.renameTool('python', 'ruby', { type: 'root' });

        expect(getYmlString()).toEqual(yaml`
          tools:
            ruby: ""
        `);
      });

      it('leaves the unset strategy untouched', () => {
        updateBitriseYmlDocumentByString(yaml`
          tools:
            node: unset
        `);

        ToolsService.renameTool('node', 'ruby', { type: 'root' });

        expect(getYmlString()).toEqual(yaml`
          tools:
            ruby: unset
        `);
      });
    });

    describe('workflow-level', () => {
      it('renames the entry in place, keeping sibling order and dropping the stale prefix', () => {
        updateBitriseYmlDocumentByString(yaml`
          workflows:
            primary:
              tools:
                node: 22:latest
                python: "3.13.4"
        `);

        ToolsService.renameTool('node', 'ruby', { type: 'workflow', workflowId: 'primary' });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            primary:
              tools:
                ruby: latest
                python: "3.13.4"
        `);
      });

      it('throws when workflow does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`format_version: '13'`);

        expect(() => ToolsService.renameTool('node', 'ruby', { type: 'workflow', workflowId: 'missing' })).toThrow();
      });
    });
  });
});
