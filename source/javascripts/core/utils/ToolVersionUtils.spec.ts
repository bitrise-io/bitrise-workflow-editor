import semver from 'semver';

import { ToolVersions } from '../models/Tools';
import ToolVersionUtils from './ToolVersionUtils';

function versionCatalog(toolId: string, versions: string[]): ToolVersions {
  return { toolId, versions: versions.map((version) => ({ version, isSemver: semver.valid(version) !== null })) };
}

describe('ToolVersionUtils', () => {
  describe('getPrefixes', () => {
    it('cuts each version at its separators', () => {
      expect(ToolVersionUtils.getPrefixes(versionCatalog('nodejs', ['26.7.0', '26.6.0', '22.4.1']))).toEqual([
        '26',
        '26.7',
        '26.6',
        '22',
        '22.4',
      ]);
    });

    it('orders numeric prefixes newest first, comparing part by part', () => {
      // Catalog order is not relied on, and 22.11 outranks 22.4 even though it loses as a string.
      expect(
        ToolVersionUtils.getPrefixes(versionCatalog('nodejs', ['22.4.1', '24.0.0', '22.11.0', '22.12.0'])),
      ).toEqual(['24', '24.0', '22', '22.12', '22.11', '22.4']);
    });

    it('puts named prefixes after the numeric ones, in catalog order', () => {
      const catalog = versionCatalog('python', ['graalpython-22.2.0', '3.14.7', 'nightly']);

      expect(ToolVersionUtils.getPrefixes(catalog)).toEqual([
        '3',
        '3.14',
        'graalpython',
        'graalpython-22',
        'graalpython-22.2',
        'nightly',
      ]);
    });

    it('stops at the minor, because a deeper cut names one release rather than a line', () => {
      expect(ToolVersionUtils.getPrefixes(versionCatalog('java', ['26.0.2.1']))).toEqual(['26', '26.0']);
    });

    it('stops at the minor of a version spelled with a `v` too', () => {
      expect(ToolVersionUtils.getPrefixes(versionCatalog('flutter', ['v1.12.13+hotfix.9']))).toEqual(['v1', 'v1.12']);
    });

    it('does not mistake a number inside the name for the version', () => {
      // Only an all digit part starts the version, so the `3` in `miniconda3` must not end the name.
      expect(ToolVersionUtils.getPrefixes(versionCatalog('python', ['miniconda3-3.9-25.11.1']))).toEqual([
        'miniconda3',
        'miniconda3-3',
        'miniconda3-3.9',
      ]);
      expect(ToolVersionUtils.getPrefixes(versionCatalog('java', ['semeru-openj9-11.0.20']))).toEqual([
        'semeru',
        'semeru-openj9',
        'semeru-openj9-11',
        'semeru-openj9-11.0',
      ]);
    });

    it('keeps the whole name of a value that is not semver, then stops at the minor', () => {
      expect(ToolVersionUtils.getPrefixes(versionCatalog('java', ['zulu-musl-8.96.0.19']))).toEqual([
        'zulu',
        'zulu-musl',
        'zulu-musl-8',
        'zulu-musl-8.96',
      ]);
    });

    it('does not offer a line of nothing but prereleases', () => {
      const python = versionCatalog('python', ['3.16-dev', '3.15.0rc1', '3.15-dev', '3.14.7']);
      expect(ToolVersionUtils.getPrefixes(python)).toEqual(['3', '3.14']);
      // A ruby patch level is stable to mise, whatever semver makes of it.
      expect(ToolVersionUtils.getPrefixes(versionCatalog('ruby', ['2.0.0-p648']))).toEqual(['2', '2.0']);
    });

    it('does not offer a python line of nothing but alphas and betas', () => {
      const python = versionCatalog('python', ['3.16.0b1', '3.16.0a1', '3.15.0']);
      expect(ToolVersionUtils.getPrefixes(python)).toEqual(['3', '3.15']);
    });

    it('offers only cuts that mise can resolve', () => {
      // An underscore never ends a line, and a plus ends one only after a number.
      expect(ToolVersionUtils.getPrefixes(versionCatalog('java', ['semeru-openj9-8u472_b08-0.56.0']))).toEqual([
        'semeru',
        'semeru-openj9',
        'semeru-openj9-8u472_b08',
        'semeru-openj9-8u472_b08-0',
        'semeru-openj9-8u472_b08-0.56',
      ]);
      expect(ToolVersionUtils.getPrefixes(versionCatalog('ruby', ['truffleruby+graalvm-22.3.1']))).toEqual([
        'truffleruby+graalvm',
        'truffleruby+graalvm-22',
        'truffleruby+graalvm-22.3',
      ]);
    });

    it('counts major and minor from the first number a line can end on', () => {
      // `foo-1` is not a line, since a plus ends only a line that starts with a number, so the version starts at 2.
      expect(ToolVersionUtils.getPrefixes(versionCatalog('ruby', ['foo-1+bar.2.3.4']))).toEqual([
        'foo',
        'foo-1+bar',
        'foo-1+bar.2',
        'foo-1+bar.2.3',
      ]);
    });

    it('stands in for a value that has no separator to cut at', () => {
      expect(ToolVersionUtils.getPrefixes(versionCatalog('elixir', ['nightly', 'stable']))).toEqual([
        'nightly',
        'stable',
      ]);
    });

    it('deduplicates prefixes shared by several versions', () => {
      expect(ToolVersionUtils.getPrefixes(versionCatalog('nodejs', ['22.4.1', '22.4.2', '22.4.3']))).toEqual([
        '22',
        '22.4',
      ]);
    });

    it('returns nothing when the version list is missing', () => {
      expect(ToolVersionUtils.getPrefixes(undefined)).toEqual([]);
    });
  });

  describe('getSeedPrefix', () => {
    // Newest first, as the catalog API publishes it.
    const catalog = versionCatalog('nodejs', ['24.2.0', '22.12.0', '22.4.1']);

    it('keeps the minor of the version being switched away from', () => {
      expect(ToolVersionUtils.getSeedPrefix(catalog, '22.12.0')).toBe('22.12');
      expect(ToolVersionUtils.getSeedPrefix(catalog, '22')).toBe('22');
    });

    it('keeps a version that is its own minor, rather than widening it to the major', () => {
      expect(ToolVersionUtils.getSeedPrefix(catalog, '22.12')).toBe('22.12');
      expect(ToolVersionUtils.getSeedPrefix(catalog, 'v22.12.0')).toBe('v22.12');
    });

    it('keeps the major when the catalog has no such minor', () => {
      expect(ToolVersionUtils.getSeedPrefix(catalog, '22.99.0')).toBe('22');
    });

    it('passes over a cut that is a catalog entry of its own, which would never resolve past itself', () => {
      const erlang = versionCatalog('erlang', ['28.5.0.7', '28.5', '28.4.3']);
      expect(ToolVersionUtils.getSeedPrefix(erlang, '28.5.0.7')).toBe('28');
      expect(ToolVersionUtils.getSeedPrefix(erlang, '28.5')).toBe('28');
    });

    it('keeps the current value when every cut of it is a catalog entry of its own', () => {
      const erlang = versionCatalog('erlang', ['28.5.0.7', '28.5', '28', '27.3']);
      expect(ToolVersionUtils.getSeedPrefix(erlang, '28.5.0.7')).toBe('28.5.0.7');
    });

    it('keeps the vendor variant and minor of a version that is not semver', () => {
      const java = versionCatalog('java', ['zulu-musl-8.96.0.19', 'zulu-17.0.1', 'openjdk-21', '26.0.2']);
      expect(ToolVersionUtils.getSeedPrefix(java, 'zulu-musl-8.96.0.19')).toBe('zulu-musl-8.96');
      expect(ToolVersionUtils.getSeedPrefix(java, 'zulu-musl-8')).toBe('zulu-musl-8');
      expect(ToolVersionUtils.getSeedPrefix(java, 'openjdk-21')).toBe('openjdk-21');
    });

    it('keeps a value with no version number as its own line', () => {
      const withIron = versionCatalog('nodejs', ['24.2.0', '20.9.0']);
      expect(ToolVersionUtils.getSeedPrefix(withIron, 'lts-iron')).toBe('lts-iron');
      expect(ToolVersionUtils.getSeedPrefix(versionCatalog('channels', ['nightly', 'stable']), 'nightly')).toBe(
        'nightly',
      );
    });

    it('falls back to the newest suggestion when the current value shares no prefix', () => {
      expect(ToolVersionUtils.getSeedPrefix(catalog, '')).toBe('24');
      expect(ToolVersionUtils.getSeedPrefix(catalog, 'lts-iron')).toBe('24');
      expect(ToolVersionUtils.getSeedPrefix(catalog, '18.9.9')).toBe('24');
    });

    it("falls back to the current version's own prefix when there are no suggestions", () => {
      expect(ToolVersionUtils.getSeedPrefix(undefined, '2.90.0')).toBe('2.90');
      expect(ToolVersionUtils.getSeedPrefix(undefined, 'nightly')).toBe('nightly');
    });

    it('returns an empty prefix with neither suggestions nor a current version', () => {
      expect(ToolVersionUtils.getSeedPrefix(undefined, '')).toBe('');
    });
  });

  describe('getLatestVersion', () => {
    // Published newest first, the way the catalog API serves it.
    const nodeVersions = versionCatalog('nodejs', ['24.2.0', '22.12.0', '22.4.1', '20.9.0']);

    it('resolves an empty prefix to the newest version', () => {
      expect(ToolVersionUtils.getLatestVersion(nodeVersions)).toBe('24.2.0');
    });

    it('resolves a prefix to the first stable version in its line', () => {
      expect(ToolVersionUtils.getLatestVersion(nodeVersions, '22')).toBe('22.12.0');
      expect(ToolVersionUtils.getLatestVersion(nodeVersions, '22.4')).toBe('22.4.1');
      expect(ToolVersionUtils.getLatestVersion(nodeVersions, '22.4.1')).toBe('22.4.1');
    });

    it('does not match a prefix that only shares leading characters', () => {
      // A prefix names a line, so `2` names none of 24.x or 22.x.
      expect(ToolVersionUtils.getLatestVersion(nodeVersions, '2')).toBeUndefined();
    });

    it('resolves prefixes of versions that are not semver', () => {
      const python = versionCatalog('python', ['graalpython-22.2.0', 'graalpython-22.1.0', '3.14.7']);
      expect(ToolVersionUtils.getLatestVersion(python, 'graalpython')).toBe('graalpython-22.2.0');
      const java = versionCatalog('java', ['zulu-musl-8.96.0.19', 'zulu-musl-8.94.0.17', '18.0.1.1']);
      expect(ToolVersionUtils.getLatestVersion(java, 'zulu-musl-8')).toBe('zulu-musl-8.96.0.19');
    });

    it('takes the first version in catalog order, without sorting', () => {
      // `mise latest java@26` gives `26.0.2.1`.
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('java', ['26.0.2.1', '26.0.2', '26.0.1']), '26')).toBe(
        '26.0.2.1',
      );
      // mise lists flutter from its own source, so an out of order catalog line stays out of order here.
      const flutter = versionCatalog('flutter', ['v1.12.13+hotfix.7', 'v1.12.13+hotfix.9']);
      expect(ToolVersionUtils.getLatestVersion(flutter, 'v1.12.13')).toBe('v1.12.13+hotfix.7');
    });

    it('prefers an exact catalog hit over the longer versions below it', () => {
      // `mise latest java@26.0.2` gives `26.0.2`, and `mise latest swift@6.2` gives `6.2`.
      const java = versionCatalog('java', ['26.0.2.1', '26.0.2']);
      expect(ToolVersionUtils.getLatestVersion(java, '26.0.2')).toBe('26.0.2');
      const swift = versionCatalog('swift', ['6.2.4', '6.2.3', '6.2']);
      expect(ToolVersionUtils.getLatestVersion(swift, '6.2')).toBe('6.2');
    });

    it('passes over prereleases, as `latest` does', () => {
      // `mise latest python` gives `3.14.7`, skipping the dev and rc entries published above it.
      const python = versionCatalog('python', ['3.16-dev', '3.15.0rc2', '3.15-dev', '3.14.7', '3.14.6']);
      expect(ToolVersionUtils.getLatestVersion(python)).toBe('3.14.7');
      expect(ToolVersionUtils.getLatestVersion(python, '3')).toBe('3.14.7');
      expect(ToolVersionUtils.getLatestVersion(python, '3.14')).toBe('3.14.7');
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('nodejs', ['4.0.0-preview3', '3.9.1']))).toBe('3.9.1');
    });

    it('reads a marker that runs straight into a number', () => {
      // `-preview1` ends on a word character, which a `\b` anchored pattern passes over.
      const ruby = versionCatalog('ruby', ['truffleruby-23.0.0-preview1', 'truffleruby-22.3.1']);
      expect(ToolVersionUtils.getLatestVersion(ruby, 'truffleruby-2')).toBeUndefined();
      expect(ToolVersionUtils.getLatestVersion(ruby, 'truffleruby')).toBe('truffleruby-22.3.1');
    });

    it('keeps a semver prerelease part that mise does not call a prerelease', () => {
      // `mise latest ruby@2.0` gives `2.0.0-p648`, and `mise latest ruby@1` gives `1.9.3-p551`.
      const ruby = versionCatalog('ruby', ['2.0.0-p648', '2.0.0-p647', '2.0.0-rc2', '1.9.3-p551', '1.8.7']);
      expect(ToolVersionUtils.getLatestVersion(ruby, '2.0')).toBe('2.0.0-p648');
      expect(ToolVersionUtils.getLatestVersion(ruby, '1')).toBe('1.9.3-p551');
    });

    it('resolves nothing for a line that holds only prereleases', () => {
      // `mise latest python@3.16` prints nothing, and installing `3.16:latest` fails.
      const python = versionCatalog('python', ['3.16-dev', '3.15.0rc2', '3.15-dev', '3.14.7']);
      expect(ToolVersionUtils.getLatestVersion(python, '3.16')).toBeUndefined();
      expect(ToolVersionUtils.getLatestVersion(python, '3.15')).toBeUndefined();
    });

    it('passes over python alphas and betas, as mise does for python only', () => {
      const python = versionCatalog('python', ['3.16.0b1', '3.16.0a1', '3.15.0']);
      expect(ToolVersionUtils.getLatestVersion(python, '3.16')).toBeUndefined();
      expect(ToolVersionUtils.getLatestVersion(python, '3.16.0a1')).toBe('3.16.0a1');
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('nodejs', ['1.0.0a1']), '1')).toBe('1.0.0a1');
    });

    it('falls back to the whole catalog for an empty prefix, and only there', () => {
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('python', ['3.16-dev', '3.15.0rc2']))).toBe('3.16-dev');
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('elixir', ['nightly', 'stable']))).toBe('nightly');
    });

    it('resolves an empty prefix among versions that start with a number', () => {
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('python', ['graalpython-22.2.0', '3.14.7']))).toBe(
        '3.14.7',
      );
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('flutter', ['stable', 'v1.22.6']))).toBe('v1.22.6');
    });

    it('never treats an underscore as the end of a line', () => {
      // `mise latest java@semeru-openj9-8u472` prints nothing.
      const java = versionCatalog('java', ['semeru-openj9-8u472_b08-0.56.0']);
      expect(ToolVersionUtils.getLatestVersion(java, 'semeru-openj9-8u472')).toBeUndefined();
    });

    it('treats a plus as the end of a line only after a number', () => {
      const ruby = versionCatalog('ruby', ['truffleruby+graalvm-34.0.1', 'truffleruby-34.0.1']);
      expect(ToolVersionUtils.getLatestVersion(ruby, 'truffleruby')).toBe('truffleruby-34.0.1');
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('flutter', ['1.9.1+hotfix.2']), '1.9.1')).toBe(
        '1.9.1+hotfix.2',
      );
    });

    it('matches a numeric prefix with or without a leading v', () => {
      // `mise latest flutter@v1` gives `1.22.6`.
      const flutter = versionCatalog('flutter', ['1.22.6', 'v1.12.13+hotfix.9']);
      expect(ToolVersionUtils.getLatestVersion(flutter, 'v1')).toBe('1.22.6');
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('flutter', ['v1.12.13+hotfix.9']), '1')).toBe(
        'v1.12.13+hotfix.9',
      );
    });

    it('follows java replacing the matcher: a plus ends any line, and there are no v spellings', () => {
      const java = versionCatalog('java', ['trava-11.0.9+2', '17.0.1']);
      expect(ToolVersionUtils.getLatestVersion(java, 'trava-11.0.9')).toBe('trava-11.0.9+2');
      expect(ToolVersionUtils.getLatestVersion(java, 'v17')).toBeUndefined();
    });

    it('resolves an exact prerelease to itself, except for java', () => {
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('python', ['3.16-dev']), '3.16-dev')).toBe('3.16-dev');
      const java = versionCatalog('java', ['sapmachine-19.0.2-beta', 'sapmachine-19.0.1']);
      expect(ToolVersionUtils.getLatestVersion(java, 'sapmachine-19.0.2-beta')).toBeUndefined();
    });

    it('drops a leading v from a named prefix too, as mise does', () => {
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('nodejs', ['endor-1']), 'vendor')).toBe('endor-1');
    });

    it('runs a vendor prefix ending in a dash straight into the version', () => {
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('java', ['temurin-25.0.1']), 'temurin-')).toBe(
        'temurin-25.0.1',
      );
    });

    it('reads a prefix of latest as bare latest, as the CLI does', () => {
      expect(ToolVersionUtils.getLatestVersion(nodeVersions, 'latest')).toBe('24.2.0');
      expect(ToolVersionUtils.isPrefixInCatalog(nodeVersions, 'latest')).toBe(true);
    });

    it('resolves the aliases mise swaps in before matching', () => {
      // `mise latest node@lts` gives `24.21.0`, and `mise latest java@lts` gives `25.0.2`.
      expect(ToolVersionUtils.getLatestVersion(nodeVersions, 'lts')).toBe('24.2.0');
      expect(ToolVersionUtils.getLatestVersion(nodeVersions, 'lts-iron')).toBe('20.9.0');
      expect(ToolVersionUtils.getLatestVersion(nodeVersions, 'lts/iron')).toBe('20.9.0');
      expect(ToolVersionUtils.isPrefixInCatalog(nodeVersions, 'lts')).toBe(true);
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('java', ['25.0.2', '21.0.9']), 'lts')).toBe('25.0.2');
    });

    it('returns undefined when nothing starts with the prefix', () => {
      expect(ToolVersionUtils.getLatestVersion(nodeVersions, '29')).toBeUndefined();
    });

    it('returns undefined without a version list', () => {
      expect(ToolVersionUtils.getLatestVersion(undefined)).toBeUndefined();
      expect(ToolVersionUtils.getLatestVersion(versionCatalog('nodejs', []))).toBeUndefined();
    });
  });

  describe('isPrefixInCatalog', () => {
    const catalog = versionCatalog('nodejs', ['22.4.1', '24.2.0']);

    it('accepts a prefix that names a line in the catalog', () => {
      expect(ToolVersionUtils.isPrefixInCatalog(catalog, '22')).toBe(true);
      expect(ToolVersionUtils.isPrefixInCatalog(catalog, '22.4')).toBe(true);
    });

    it('accepts an empty prefix, which is what bare `latest` means', () => {
      expect(ToolVersionUtils.isPrefixInCatalog(catalog, '')).toBe(true);
    });

    it('accepts bare `latest` on a catalog of names, which mise answers from the whole list', () => {
      expect(ToolVersionUtils.isPrefixInCatalog(versionCatalog('elixir', ['nightly', 'stable']), 'latest')).toBe(true);
      expect(ToolVersionUtils.isPrefixInCatalog(versionCatalog('elixir', []), 'latest')).toBe(false);
    });

    it('accepts a prefix that names a whole version', () => {
      expect(ToolVersionUtils.isPrefixInCatalog(catalog, '22.4.1')).toBe(true);
    });

    it('accepts a prefix of a value that is not semver', () => {
      const java = versionCatalog('java', ['zulu-musl-8.96.0.19']);

      expect(ToolVersionUtils.isPrefixInCatalog(java, 'zulu')).toBe(true);
      expect(ToolVersionUtils.isPrefixInCatalog(java, 'zulu-musl-8')).toBe(true);
    });

    it('rejects a prefix that only shares leading characters with a version', () => {
      // `2` names no line at all, and `24.2` names the `24.2.x` line rather than `24.20.0`.
      expect(ToolVersionUtils.isPrefixInCatalog(catalog, '2')).toBe(false);
      expect(ToolVersionUtils.isPrefixInCatalog(versionCatalog('nodejs', ['24.20.0']), '24.2')).toBe(false);
      expect(ToolVersionUtils.isPrefixInCatalog(versionCatalog('java', ['zulu-musl-8.96.0.19']), 'zul')).toBe(false);
    });

    it('rejects a prefix cut where mise sees no boundary', () => {
      const java = versionCatalog('java', ['semeru-openj9-8u472_b08-0.56.0']);
      const ruby = versionCatalog('ruby', ['truffleruby+graalvm-22.3.1']);

      expect(ToolVersionUtils.isPrefixInCatalog(java, 'semeru-openj9-8u472')).toBe(false);
      expect(ToolVersionUtils.isPrefixInCatalog(ruby, 'truffleruby')).toBe(false);
    });

    it('accepts a numeric prefix spelled with a v the catalog leaves out', () => {
      expect(ToolVersionUtils.isPrefixInCatalog(versionCatalog('flutter', ['1.22.6']), 'v1')).toBe(true);
    });

    it('rejects a prefix no version starts with', () => {
      expect(ToolVersionUtils.isPrefixInCatalog(catalog, '18')).toBe(false);
      expect(ToolVersionUtils.isPrefixInCatalog(catalog, '22.9')).toBe(false);
    });
  });
});
