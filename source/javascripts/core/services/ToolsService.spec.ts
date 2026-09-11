import semver from 'semver';

import ToolsService from '@/core/services/ToolsService';

import { ToolVersions } from '../models/Tools';
import { getYmlString, updateBitriseYmlDocumentByString } from '../stores/BitriseYmlStore';

function versionCatalog(toolId: string, versions: string[], isSemver = true): ToolVersions {
  return { toolId, versions: versions.map((version) => ({ version, isSemver })) };
}

describe('ToolsService', () => {
  describe('parseToolVersion', () => {
    it('parses "<prefix>:latest" as latest-of', () => {
      expect(ToolsService.parseToolVersion('22:latest')).toEqual({
        strategy: 'latest-of',
        prefix: '22',
        preferInstalled: false,
      });
      expect(ToolsService.parseToolVersion('3.3:latest')).toEqual({
        strategy: 'latest-of',
        prefix: '3.3',
        preferInstalled: false,
      });
    });

    it('parses "<prefix>:installed" as latest-of, installed', () => {
      expect(ToolsService.parseToolVersion('3.3:installed')).toEqual({
        strategy: 'latest-of',
        prefix: '3.3',
        preferInstalled: true,
      });
    });

    it('parses the bare keywords as latest-of with no prefix', () => {
      expect(ToolsService.parseToolVersion('latest')).toEqual({
        strategy: 'latest-of',
        prefix: '',
        preferInstalled: false,
      });
      expect(ToolsService.parseToolVersion('installed')).toEqual({
        strategy: 'latest-of',
        prefix: '',
        preferInstalled: true,
      });
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

    it('takes the prefix up to the last colon that starts a keyword, as the CLI does', () => {
      // Greedy and end anchored, so everything before `:latest` is the prefix, colons included.
      expect(ToolsService.parseToolVersion('a:b:latest')).toEqual({
        strategy: 'latest-of',
        prefix: 'a:b',
        preferInstalled: false,
      });
    });

    it('reads a leading-colon value as the bare keyword, as the CLI does', () => {
      // The capture group may be empty, so `:latest` is bare `latest` and serializes back as such.
      expect(ToolsService.parseToolVersion(':latest')).toEqual({
        strategy: 'latest-of',
        prefix: '',
        preferInstalled: false,
      });
      expect(ToolsService.serializeToolVersion(ToolsService.parseToolVersion(':latest'))).toBe('latest');
    });

    it('trims surrounding whitespace, the way the CLI does before it parses', () => {
      expect(ToolsService.parseToolVersion(' 22:latest ')).toEqual({
        strategy: 'latest-of',
        prefix: '22',
        preferInstalled: false,
      });
      expect(ToolsService.parseToolVersion('  3.13.4  ')).toEqual({ strategy: 'exact', version: '3.13.4' });
      expect(ToolsService.parseToolVersion('   ')).toEqual({ strategy: 'exact', version: '' });
    });

    it('tolerates non-string values from hand-edited YAML', () => {
      expect(ToolsService.parseToolVersion(3.13)).toEqual({ strategy: 'exact', version: '3.13' });
      expect(ToolsService.parseToolVersion(null)).toEqual({ strategy: 'exact', version: '' });
      expect(ToolsService.parseToolVersion(undefined)).toEqual({ strategy: 'exact', version: '' });
    });

    it('parses keywords case-insensitively', () => {
      expect(ToolsService.parseToolVersion('Latest')).toEqual({
        strategy: 'latest-of',
        prefix: '',
        preferInstalled: false,
      });
      expect(ToolsService.parseToolVersion('LATEST')).toEqual({
        strategy: 'latest-of',
        prefix: '',
        preferInstalled: false,
      });
      expect(ToolsService.parseToolVersion('Installed')).toEqual({
        strategy: 'latest-of',
        prefix: '',
        preferInstalled: true,
      });
      expect(ToolsService.parseToolVersion('INSTALLED')).toEqual({
        strategy: 'latest-of',
        prefix: '',
        preferInstalled: true,
      });
      expect(ToolsService.parseToolVersion('Unset')).toEqual({ strategy: 'unset' });
      expect(ToolsService.parseToolVersion('22:Latest')).toEqual({
        strategy: 'latest-of',
        prefix: '22',
        preferInstalled: false,
      });
      expect(ToolsService.parseToolVersion('3.3:INSTALLED')).toEqual({
        strategy: 'latest-of',
        prefix: '3.3',
        preferInstalled: true,
      });
    });

    // A committed row renders from what setTool wrote, so a lossy round trip would change the
    // controls under the user.
    it.each([
      ['22:latest', '22', false],
      ['22:installed', '22', true],
      ['latest', '', false],
      ['installed', '', true],
    ])('round-trips %s', (raw, prefix, preferInstalled) => {
      const parsed = ToolsService.parseToolVersion(raw);

      expect(parsed).toEqual({ strategy: 'latest-of', prefix, preferInstalled });
      expect(ToolsService.serializeToolVersion(parsed)).toBe(raw);
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

      expect(ToolsService.getVersionOptions(catalog)).toEqual([
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

      expect(ToolsService.getVersionOptions(catalog).map(({ value }) => value)).toEqual([
        '24.0.0',
        '22.4.1',
        'lts-iron',
        'nightly',
      ]);
    });

    it('returns nothing when the catalog is undefined', () => {
      expect(ToolsService.getVersionOptions(undefined)).toEqual([]);
    });
  });

  describe('withConfiguredValue', () => {
    const options = [
      { value: '24.0.0', label: '24.0.0' },
      { value: '22.4.1', label: '22.4.1' },
    ];

    it('injects a configured value the options do not offer at the top', () => {
      expect(ToolsService.withConfiguredValue(options, '18.9.9').map(({ value }) => value)).toEqual([
        '18.9.9',
        '24.0.0',
        '22.4.1',
      ]);
    });

    it('does not duplicate a configured value the options already offer', () => {
      expect(ToolsService.withConfiguredValue(options, '22.4.1')).toBe(options);
    });

    it('ignores an empty configured value', () => {
      expect(ToolsService.withConfiguredValue(options, '')).toBe(options);
      expect(ToolsService.withConfiguredValue([], '')).toEqual([]);
    });

    it('stands alone when there are no options to offer', () => {
      expect(ToolsService.withConfiguredValue([], '18.9.9')).toEqual([{ value: '18.9.9', label: '18.9.9' }]);
    });
  });

  describe('getPrefixOptions', () => {
    const values = (toolVersions: ToolVersions | undefined) =>
      ToolsService.getPrefixOptions(toolVersions).map(({ value }) => value);

    it('cuts each version at its separators', () => {
      expect(values(versionCatalog('nodejs', ['26.7.0', '26.6.0', '22.4.1']))).toEqual([
        '26',
        '26.7',
        '26.6',
        '22',
        '22.4',
      ]);
    });

    it('orders numeric prefixes newest first, comparing part by part', () => {
      // Catalog order is not relied on, and 22.11 outranks 22.4 even though it loses as a string.
      expect(values(versionCatalog('nodejs', ['22.4.1', '24.0.0', '22.11.0', '22.12.0']))).toEqual([
        '24',
        '24.0',
        '22',
        '22.12',
        '22.11',
        '22.4',
      ]);
    });

    it('puts named prefixes after the numeric ones, in catalog order', () => {
      const catalog: ToolVersions = {
        toolId: 'nodejs',
        versions: [
          { version: 'lts-iron', isSemver: false },
          { version: '22.4.1', isSemver: true },
          { version: 'nightly', isSemver: false },
        ],
      };

      expect(values(catalog)).toEqual(['22', '22.4', 'lts', 'nightly']);
    });

    it('stops at the minor, because a deeper cut names one release rather than a line', () => {
      // The catalog has thousands of these, and `26.0.2` only ever resolves to `26.0.2.1`.
      expect(values(versionCatalog('java', ['26.0.2.1'], false))).toEqual(['26', '26.0']);
    });

    it('does not mistake a number inside the name for the version', () => {
      // Only an all digit part starts the version, so the `3` in `miniconda3` must not end the name.
      expect(values(versionCatalog('python', ['miniconda3-3.9-25.11.1'], false))).toEqual([
        'miniconda3',
        'miniconda3-3',
        'miniconda3-3.9',
      ]);
      expect(values(versionCatalog('java', ['semeru-openj9-11.0.20'], false))).toEqual([
        'semeru',
        'semeru-openj9',
        'semeru-openj9-11',
        'semeru-openj9-11.0',
      ]);
    });

    it('keeps the whole name of a value that is not semver, then stops at the minor', () => {
      expect(values(versionCatalog('java', ['zulu-musl-8.96.0.19'], false))).toEqual([
        'zulu',
        'zulu-musl',
        'zulu-musl-8',
        'zulu-musl-8.96',
      ]);
      expect(values(versionCatalog('python', ['3.15.0rc1', '3.15-dev'], false))).toEqual(['3', '3.15']);
    });

    it('stands in for a value that has no separator to cut at', () => {
      expect(values(versionCatalog('elixir', ['nightly', 'stable'], false))).toEqual(['nightly', 'stable']);
    });

    it('deduplicates prefixes shared by several versions', () => {
      expect(values(versionCatalog('nodejs', ['22.4.1', '22.4.2', '22.4.3']))).toEqual(['22', '22.4']);
    });

    it('returns nothing when the version list is missing', () => {
      expect(values(undefined)).toEqual([]);
    });
  });

  describe('getLatestVersion', () => {
    const mixedCatalog = (versions: string[]): ToolVersions => ({
      toolId: 'nodejs',
      versions: versions.map((version) => ({ version, isSemver: semver.valid(version) !== null })),
    });
    // Published newest first, the way the catalog API serves it.
    const nodeVersions = mixedCatalog(['24.2.0', '22.12.0', '22.4.1', '20.9.0', 'lts-iron']);

    it('resolves an empty prefix to the newest version', () => {
      expect(ToolsService.getLatestVersion(nodeVersions)).toBe('24.2.0');
    });

    it('resolves a prefix to the highest version starting with it', () => {
      expect(ToolsService.getLatestVersion(nodeVersions, '22')).toBe('22.12.0');
      expect(ToolsService.getLatestVersion(nodeVersions, '22.4')).toBe('22.4.1');
      expect(ToolsService.getLatestVersion(nodeVersions, '22.4.1')).toBe('22.4.1');
    });

    it('does not match a prefix that only shares leading characters', () => {
      // A prefix names a line, so `2` names none of 24.x or 22.x.
      expect(ToolsService.getLatestVersion(nodeVersions, '2')).toBeUndefined();
    });

    it('resolves prefixes of versions that are not semver', () => {
      expect(ToolsService.getLatestVersion(nodeVersions, 'lts')).toBe('lts-iron');
      const java = mixedCatalog(['zulu-musl-8.96.0.19', 'zulu-musl-8.94.0.17', '18.0.1.1']);
      expect(ToolsService.getLatestVersion(java, 'zulu-musl-8')).toBe('zulu-musl-8.96.0.19');
    });

    it('returns undefined when nothing starts with the prefix', () => {
      expect(ToolsService.getLatestVersion(nodeVersions, '29')).toBeUndefined();
    });

    it('returns undefined without a version list', () => {
      expect(ToolsService.getLatestVersion(undefined)).toBeUndefined();
      expect(ToolsService.getLatestVersion(mixedCatalog([]))).toBeUndefined();
    });
  });

  describe('isPrefixInCatalog', () => {
    const catalog = versionCatalog('nodejs', ['22.4.1', '24.2.0']);

    it('accepts a prefix that names a line in the catalog', () => {
      expect(ToolsService.isPrefixInCatalog(catalog, '22')).toBe(true);
      expect(ToolsService.isPrefixInCatalog(catalog, '22.4')).toBe(true);
    });

    it('accepts an empty prefix, which is what bare `latest` means', () => {
      expect(ToolsService.isPrefixInCatalog(catalog, '')).toBe(true);
    });

    it('accepts a prefix that names a whole version', () => {
      expect(ToolsService.isPrefixInCatalog(catalog, '22.4.1')).toBe(true);
    });

    it('accepts a prefix of a value that is not semver', () => {
      const java = versionCatalog('java', ['zulu-musl-8.96.0.19'], false);

      expect(ToolsService.isPrefixInCatalog(java, 'zulu')).toBe(true);
      expect(ToolsService.isPrefixInCatalog(java, 'zulu-musl-8')).toBe(true);
    });

    it('rejects a prefix that only shares leading characters with a version', () => {
      // `2` names no line at all, and `24.2` names the `24.2.x` line rather than `24.20.0`.
      expect(ToolsService.isPrefixInCatalog(catalog, '2')).toBe(false);
      expect(ToolsService.isPrefixInCatalog(versionCatalog('nodejs', ['24.20.0']), '24.2')).toBe(false);
      expect(ToolsService.isPrefixInCatalog(versionCatalog('java', ['zulu-musl-8.96.0.19'], false), 'zul')).toBe(false);
    });

    it('rejects a prefix no version starts with', () => {
      expect(ToolsService.isPrefixInCatalog(catalog, '18')).toBe(false);
      expect(ToolsService.isPrefixInCatalog(catalog, '22.9')).toBe(false);
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
  });

  describe('toParsedToolVersion', () => {
    it('builds latest-of from the prefix field and the installed checkbox', () => {
      expect(ToolsService.toParsedToolVersion('latest-of', '22', true)).toEqual({
        strategy: 'latest-of',
        prefix: '22',
        preferInstalled: true,
      });
      expect(ToolsService.toParsedToolVersion('latest-of', '')).toEqual({
        strategy: 'latest-of',
        prefix: '',
        preferInstalled: false,
      });
    });

    it('ignores the installed flag for the strategies that have no use for it', () => {
      expect(ToolsService.toParsedToolVersion('exact', '22.4.1', true)).toEqual({
        strategy: 'exact',
        version: '22.4.1',
      });
      expect(ToolsService.toParsedToolVersion('unset', '', true)).toEqual({ strategy: 'unset' });
    });
  });

  describe('getVersionInputValue', () => {
    it('returns the value the version field shows for each strategy', () => {
      expect(ToolsService.getVersionInputValue({ strategy: 'exact', version: '22.4.1' })).toBe('22.4.1');
      expect(ToolsService.getVersionInputValue({ strategy: 'latest-of', prefix: '22', preferInstalled: true })).toBe(
        '22',
      );
      expect(ToolsService.getVersionInputValue({ strategy: 'latest-of', prefix: '', preferInstalled: false })).toBe('');
      expect(ToolsService.getVersionInputValue({ strategy: 'unset' })).toBe('');
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
      expect(() => ToolsService.setTool('node', { strategy: 'unset' }, { type: 'root' })).toThrow();
    });

    describe('root-level', () => {
      it('creates the tools block when absent', () => {
        updateBitriseYmlDocumentByString(yaml`format_version: '13'`);

        ToolsService.setTool('node', { strategy: 'latest-of', prefix: '22', preferInstalled: false }, { type: 'root' });

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

        ToolsService.setTool('python', { strategy: 'exact', version: '3.13.4' }, { type: 'root' });

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

        ToolsService.setTool('node', { strategy: 'latest-of', prefix: '', preferInstalled: false }, { type: 'root' });

        expect(getYmlString()).toEqual(yaml`
          tools:
            node: latest
            python: "3.13.4"
        `);
      });

      it('sets the installed variant with a prefix', () => {
        updateBitriseYmlDocumentByString(yaml`format_version: '13'`);

        ToolsService.setTool('ruby', { strategy: 'latest-of', prefix: '3.3', preferInstalled: true }, { type: 'root' });

        expect(getYmlString()).toEqual(yaml`
          format_version: '13'
          tools:
            ruby: 3.3:installed
        `);
      });

      it('sets the installed variant without a prefix', () => {
        updateBitriseYmlDocumentByString(yaml`format_version: '13'`);

        ToolsService.setTool('ruby', { strategy: 'latest-of', prefix: '', preferInstalled: true }, { type: 'root' });

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

        ToolsService.setTool(
          'node',
          { strategy: 'latest-of', prefix: '22', preferInstalled: false },
          { type: 'workflow', workflowId: 'primary' },
        );

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

        ToolsService.setTool(
          'python',
          { strategy: 'exact', version: '3.13.4' },
          { type: 'workflow', workflowId: 'primary' },
        );

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

        ToolsService.setTool('node', { strategy: 'unset' }, { type: 'workflow', workflowId: 'primary' });

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

        ToolsService.setTool(
          'python',
          { strategy: 'exact', version: '3.13.4' },
          { type: 'workflow', workflowId: 'secondary' },
        );

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
          ToolsService.setTool(
            'node',
            { strategy: 'latest-of', prefix: '', preferInstalled: false },
            { type: 'workflow', workflowId: 'missing' },
          ),
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

      it('clears an unquoted numeric version written by hand', () => {
        updateBitriseYmlDocumentByString(yaml`
          tools:
            python: 3.13
        `);

        ToolsService.renameTool('python', 'ruby', { type: 'root' });

        expect(getYmlString()).toEqual(yaml`
          tools:
            ruby: ""
        `);
      });

      it('throws when the tool does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`
          tools:
            node: latest
        `);

        expect(() => ToolsService.renameTool('python', 'ruby', { type: 'root' })).toThrow();
        expect(getYmlString()).toEqual(yaml`
          tools:
            node: latest
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
