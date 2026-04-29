import ToolsService, { ToolsSource } from '@/core/services/ToolsService';

import { getYmlString, updateBitriseYmlDocumentByString } from '../stores/BitriseYmlStore';

describe('ToolsService', () => {
  describe('parseToolVersion', () => {
    it('parses "latest" as absolute-latest', () => {
      expect(ToolsService.parseToolVersion('latest')).toEqual({ strategy: 'absolute-latest' });
    });

    it('parses "<prefix>:latest" as latest-of', () => {
      expect(ToolsService.parseToolVersion('22:latest')).toEqual({ strategy: 'latest-of', prefix: '22' });
      expect(ToolsService.parseToolVersion('3.3:latest')).toEqual({ strategy: 'latest-of', prefix: '3.3' });
    });

    it('parses "<prefix>:installed" as preinstalled', () => {
      expect(ToolsService.parseToolVersion('3.3:installed')).toEqual({ strategy: 'preinstalled', prefix: '3.3' });
    });

    it('parses a bare semver as exact', () => {
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
    it('serializes absolute-latest', () => {
      expect(ToolsService.serializeToolVersion({ strategy: 'absolute-latest' })).toBe('latest');
    });

    it('serializes latest-of', () => {
      expect(ToolsService.serializeToolVersion({ strategy: 'latest-of', prefix: '22' })).toBe('22:latest');
    });

    it('serializes preinstalled', () => {
      expect(ToolsService.serializeToolVersion({ strategy: 'preinstalled', prefix: '3.3' })).toBe('3.3:installed');
    });

    it('serializes exact', () => {
      expect(ToolsService.serializeToolVersion({ strategy: 'exact', version: '3.13.4' })).toBe('3.13.4');
    });

    it('serializes unset', () => {
      expect(ToolsService.serializeToolVersion({ kind: 'unset' })).toBe('unset');
    });

    it.each([['latest'], ['22:latest'], ['3.3:installed'], ['3.13.4'], ['unset']])('round-trips %p', (raw: string) => {
      expect(ToolsService.serializeToolVersion(ToolsService.parseToolVersion(raw))).toBe(raw);
    });
  });

  describe('validateToolId', () => {
    it('rejects empty and whitespace-only IDs', () => {
      expect(ToolsService.validateToolId('')).toBe('Tool ID is required');
      expect(ToolsService.validateToolId('   ')).toBe('Tool ID is required');
    });

    it('rejects duplicate IDs', () => {
      expect(ToolsService.validateToolId('node', ['node', 'python'])).toBe('Tool ID must be unique');
    });

    it('accepts a fresh ID', () => {
      expect(ToolsService.validateToolId('ruby', ['node', 'python'])).toBe(true);
    });
  });

  describe('setTool', () => {
    describe('root-level', () => {
      it('creates the tools block when absent', () => {
        updateBitriseYmlDocumentByString(yaml`format_version: '13'`);

        ToolsService.setTool('node', '22:latest', ToolsSource.Root);

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

        ToolsService.setTool('python', '3.13.4', ToolsSource.Root);

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

        ToolsService.setTool('node', 'latest', ToolsSource.Root);

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

        ToolsService.setTool('node', '22:latest', ToolsSource.Workflow, 'primary');

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

        ToolsService.setTool('python', '3.13.4', ToolsSource.Workflow, 'primary');

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

        ToolsService.setTool('node', 'unset', ToolsSource.Workflow, 'primary');

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

        ToolsService.setTool('python', '3.13.4', ToolsSource.Workflow, 'secondary');

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

        expect(() => ToolsService.setTool('node', 'latest', ToolsSource.Workflow, 'missing')).toThrow();
      });

      it('throws when workflowId is missing', () => {
        updateBitriseYmlDocumentByString(yaml`format_version: '13'`);

        expect(() => ToolsService.setTool('node', 'latest', ToolsSource.Workflow)).toThrow();
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

        ToolsService.deleteTool('node', ToolsSource.Root);

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

        ToolsService.deleteTool('node', ToolsSource.Root);

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

        ToolsService.deleteTool('node', ToolsSource.Workflow, 'primary');

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

        ToolsService.deleteTool('node', ToolsSource.Workflow, 'primary');

        expect(getYmlString()).toEqual(yaml`
          workflows:
            primary:
              steps: []
        `);
      });
    });
  });
});
