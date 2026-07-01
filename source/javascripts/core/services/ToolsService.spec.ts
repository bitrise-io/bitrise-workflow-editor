import ToolsService from '@/core/services/ToolsService';

import ToolCatalogApi from '../api/ToolCatalogApi';
import { ToolVersions } from '../models/Tools';
import { getYmlString, updateBitriseYmlDocumentByString } from '../stores/BitriseYmlStore';

function versionCatalog(toolId: string, versions: string[], isSemver = true): ToolVersions {
  return { toolId, versions: versions.map((version) => ({ version, isSemver })) };
}

describe('ToolsService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

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
  });

  describe('validateToolVersion', () => {
    it('rejects empty and whitespace-only versions', () => {
      expect(ToolsService.validateToolVersion('')).toBe('Tool version is required');
      expect(ToolsService.validateToolVersion('   ')).toBe('Tool version is required');
    });

    it('rejects a leading colon', () => {
      expect(ToolsService.validateToolVersion(':latest')).toBe('Tool version must not start with ":"');
    });

    it('rejects a trailing colon with no suffix', () => {
      expect(ToolsService.validateToolVersion('22:')).toBe(
        'Tool version must specify "latest" or "installed" after ":"',
      );
    });

    it('rejects unknown suffixes after a colon', () => {
      expect(ToolsService.validateToolVersion('22:beta')).toBe('Tool version suffix must be "latest" or "installed"');
      expect(ToolsService.validateToolVersion('foo:bar')).toBe('Tool version suffix must be "latest" or "installed"');
    });

    it.each([['latest'], ['installed'], ['unset'], ['22:latest'], ['3.3:installed'], ['3'], ['3.3'], ['3.13.4']])(
      'accepts %p',
      (raw: string) => {
        expect(ToolsService.validateToolVersion(raw)).toBe(true);
      },
    );
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

  describe('getToolCatalog', () => {
    it('returns the fetched catalog', async () => {
      jest.spyOn(ToolCatalogApi, 'getToolCatalog').mockResolvedValue({
        tools: [
          { name: 'nodejs', aliases: [] },
          { name: 'golang', aliases: [] },
        ],
      });

      await expect(ToolsService.getToolCatalog()).resolves.toEqual({
        tools: [
          { name: 'nodejs', aliases: [] },
          { name: 'golang', aliases: [] },
        ],
      });
    });

    it('propagates a rejection from the API', async () => {
      jest.spyOn(ToolCatalogApi, 'getToolCatalog').mockRejectedValue(new Error('boom'));

      await expect(ToolsService.getToolCatalog()).rejects.toThrow('boom');
    });
  });

  describe('getToolVersions', () => {
    it('returns the fetched version catalog', async () => {
      jest.spyOn(ToolCatalogApi, 'getToolVersions').mockResolvedValue(versionCatalog('nodejs', ['26.4.0', '24.16.0']));

      await expect(ToolsService.getToolVersions('nodejs')).resolves.toEqual(
        versionCatalog('nodejs', ['26.4.0', '24.16.0']),
      );
    });

    it('propagates a rejection from the API', async () => {
      jest.spyOn(ToolCatalogApi, 'getToolVersions').mockRejectedValue(new Error('boom'));

      await expect(ToolsService.getToolVersions('nodejs')).rejects.toThrow('boom');
    });
  });
});
