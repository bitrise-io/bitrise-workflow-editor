import ToolsService from '@/core/services/ToolsService';

import { getYmlString, updateBitriseYmlDocumentByString } from '../stores/BitriseYmlStore';

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

    it('parses bare partial versions as latest-installed with that prefix', () => {
      expect(ToolsService.parseToolVersion('3')).toEqual({ strategy: 'latest-installed', prefix: '3' });
      expect(ToolsService.parseToolVersion('3.3')).toEqual({ strategy: 'latest-installed', prefix: '3.3' });
    });

    it('parses "x"-suffixed partial versions by stripping ".x" segments', () => {
      expect(ToolsService.parseToolVersion('3.3.x')).toEqual({ strategy: 'latest-installed', prefix: '3.3' });
      expect(ToolsService.parseToolVersion('3.x.x')).toEqual({ strategy: 'latest-installed', prefix: '3' });
    });

    it('parses a bare complete semver triple as exact', () => {
      expect(ToolsService.parseToolVersion('3.13.4')).toEqual({ strategy: 'exact', version: '3.13.4' });
    });

    it('parses "unset"', () => {
      expect(ToolsService.parseToolVersion('unset')).toEqual({ kind: 'unset' });
    });

    it('treats empty string as exact with empty version', () => {
      expect(ToolsService.parseToolVersion('')).toEqual({ strategy: 'exact', version: '' });
    });

    it('treats a malformed value with unknown suffix as exact', () => {
      expect(ToolsService.parseToolVersion('foo:bar')).toEqual({ strategy: 'exact', version: 'foo:bar' });
    });

    it('treats a leading-colon value as exact', () => {
      expect(ToolsService.parseToolVersion(':latest')).toEqual({ strategy: 'exact', version: ':latest' });
    });
  });

  describe('serializeToolVersion', () => {
    it('serializes latest-released without prefix', () => {
      expect(ToolsService.serializeToolVersion({ strategy: 'latest-released' })).toBe('latest');
    });

    it('serializes latest-released with prefix', () => {
      expect(ToolsService.serializeToolVersion({ strategy: 'latest-released', prefix: '22' })).toBe('22:latest');
    });

    it('serializes latest-installed with prefix', () => {
      expect(ToolsService.serializeToolVersion({ strategy: 'latest-installed', prefix: '3.3' })).toBe('3.3:installed');
    });

    it('serializes latest-installed without prefix', () => {
      expect(ToolsService.serializeToolVersion({ strategy: 'latest-installed' })).toBe('installed');
    });

    it('serializes exact', () => {
      expect(ToolsService.serializeToolVersion({ strategy: 'exact', version: '3.13.4' })).toBe('3.13.4');
    });

    it('serializes unset', () => {
      expect(ToolsService.serializeToolVersion({ kind: 'unset' })).toBe('unset');
    });

    it.each([['latest'], ['installed'], ['22:latest'], ['3.3:installed'], ['3.13.4'], ['unset']])(
      'round-trips %p',
      (raw: string) => {
        expect(ToolsService.serializeToolVersion(ToolsService.parseToolVersion(raw))).toBe(raw);
      },
    );

    it('normalises "x"-suffixed partials when round-tripping', () => {
      expect(ToolsService.serializeToolVersion(ToolsService.parseToolVersion('3.x.x'))).toBe('3:installed');
      expect(ToolsService.serializeToolVersion(ToolsService.parseToolVersion('3.3.x'))).toBe('3.3:installed');
      expect(ToolsService.serializeToolVersion(ToolsService.parseToolVersion('3'))).toBe('3:installed');
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
    describe('root-level', () => {
      it('creates the tools block when absent', () => {
        updateBitriseYmlDocumentByString(yaml`format_version: '13'`);

        ToolsService.setTool('node', '22:latest', { type: 'root' });

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

        ToolsService.setTool('python', '3.13.4', { type: 'root' });

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

        ToolsService.setTool('node', 'latest', { type: 'root' });

        expect(getYmlString()).toEqual(yaml`
          tools:
            node: latest
            python: "3.13.4"
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

        ToolsService.setTool('node', '22:latest', { type: 'workflow', workflowId: 'primary' });

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

        ToolsService.setTool('python', '3.13.4', { type: 'workflow', workflowId: 'primary' });

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

        ToolsService.setTool('node', 'unset', { type: 'workflow', workflowId: 'primary' });

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

        ToolsService.setTool('python', '3.13.4', { type: 'workflow', workflowId: 'secondary' });

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

        expect(() => ToolsService.setTool('node', 'latest', { type: 'workflow', workflowId: 'missing' })).toThrow();
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
});
