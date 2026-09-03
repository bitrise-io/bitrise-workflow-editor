import { mergeYamls } from './mergeYamls';

describe('mergeYamls', () => {
  it('cleanly merges non-overlapping changes from both sides', () => {
    const base = 'a: 1\nb: 2\n';
    const yours = 'a: 1\nb: 2\nc: 3\n'; // added c
    const remote = 'a: 0\nb: 2\n'; // changed a

    const { mergedYml, decorations } = mergeYamls(yours, base, remote);

    expect(mergedYml).toBe('a: 0\nb: 2\nc: 3\n');
    expect(decorations).toHaveLength(0);
  });

  it('resolves an overlapping change to the remote side and reports a conflict decoration', () => {
    const base = 'title: base\n';
    const yours = 'title: yours\n';
    const remote = 'title: remote\n';

    const { mergedYml, decorations } = mergeYamls(yours, base, remote);

    expect(mergedYml).toContain('title: remote');
    expect(mergedYml).not.toContain('title: yours');
    expect(decorations.length).toBeGreaterThan(0);
    expect(decorations[0].options.blockClassName).toBe('conflict');
  });

  it('positions each conflict decoration by merged-output line, not input index', () => {
    // Two overlapping changes with a clean local insertion between them. The
    // insertion is what makes this bite: it pushes the merged output past the
    // remote input, so `bIndex` and the output line stop agreeing. With
    // equal-length inputs they coincide and the bug hides.
    // Merged output is 6 lines and the second conflict is on line 6 ('dR'); the
    // old bIndex-based code marked line 4, which is 'NEW2' — your own text — and
    // left the real conflict unmarked.
    const base = 'a\nb\nc\nd\n';
    const yours = 'aY\nb\nNEW1\nNEW2\nc\ndY\n';
    const remote = 'aR\nb\nc\ndR\n';

    const { mergedYml, decorations } = mergeYamls(yours, base, remote);

    expect(mergedYml).toBe('aR\nb\nNEW1\nNEW2\nc\ndR\n');
    const startLines = decorations.map((d) => d.range.startLineNumber).sort((x, y) => x - y);
    expect(startLines).toEqual([1, 6]);
  });

  it('marks the boundary line when the remote deleted lines you had edited', () => {
    // Remote drops the middle line you changed, so the conflict resolves to an
    // empty region: there is no output line to outline, only the gap it left.
    const base = 'a\nb\nc\n';
    const yours = 'a\nbY\nc\n';
    const remote = 'a\nc\n';

    const { mergedYml, decorations } = mergeYamls(yours, base, remote);

    expect(mergedYml).toBe('a\nc\n');
    expect(decorations).toHaveLength(1);
    expect(decorations[0].options.isWholeLine).toBe(false);
    expect(decorations[0].options.blockClassName).toBe('conflict');
    expect(decorations[0].range.startLineNumber).toBe(1);
  });

  it('clamps a deletion at the top of the file to line 1', () => {
    // The gap sits above the first output line, so the unclamped boundary would
    // be line 0 — not a line Monaco can decorate.
    const base = 'a\nb\n';
    const yours = 'aY\nb\n';
    const remote = 'b\n';

    const { decorations } = mergeYamls(yours, base, remote);

    expect(decorations).toHaveLength(1);
    expect(decorations[0].range.startLineNumber).toBe(1);
    expect(decorations[0].range.endLineNumber).toBe(1);
  });

  it('returns the input unchanged when nothing differs', () => {
    const yaml = 'a: 1\nb: 2\n';
    const { mergedYml, decorations } = mergeYamls(yaml, yaml, yaml);

    expect(mergedYml).toBe('a: 1\nb: 2\n');
    expect(decorations).toHaveLength(0);
  });
});
