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
    // The clean local insertion is what makes this bite: it pushes the merged output past
    // the remote input, so `bIndex` and the output line stop agreeing (with equal-length
    // inputs they coincide and the bug hides). Second conflict is output line 6, 'dR';
    // `bIndex` marked line 4 — 'NEW2', your own text — and left the real one unmarked.
    const base = 'a\nb\nc\nd\n';
    const yours = 'aY\nb\nNEW1\nNEW2\nc\ndY\n';
    const remote = 'aR\nb\nc\ndR\n';

    const { mergedYml, decorations } = mergeYamls(yours, base, remote);

    expect(mergedYml).toBe('aR\nb\nNEW1\nNEW2\nc\ndR\n');
    const startLines = decorations.map((d) => d.range.startLineNumber).sort((x, y) => x - y);
    expect(startLines).toEqual([1, 6]);
  });

  it('marks the gap a remote deletion left, positioned by merged-output line', () => {
    // Remote drops the line you changed: no output line to outline, only the gap it left.
    // 'c' went from between 'b' (line 4) and 'd' (line 5), so the gap is line 5's top edge.
    // A line earlier gives 4, a full line too high; `oIndex` gives 3 — 'NEW2', your text.
    const base = 'a\nb\nc\nd\n';
    const yours = 'a\nNEW1\nNEW2\nb\ncY\nd\n';
    const remote = 'a\nb\nd\n';

    const { mergedYml, decorations } = mergeYamls(yours, base, remote);

    expect(mergedYml).toBe('a\nNEW1\nNEW2\nb\nd\n');
    expect(decorations).toHaveLength(1);
    expect(decorations[0].options.isWholeLine).toBe(false);
    expect(decorations[0].options.blockClassName).toBe('conflict');
    expect(decorations[0].range.startLineNumber).toBe(5);
    expect(decorations[0].range.endLineNumber).toBe(5);
  });

  it('renders a trailing deletion after the last line, not above it', () => {
    // Nothing follows the removed tail, so the gap is below the 1-line output. Left at the
    // out-of-range line 2, Monaco pulls it back to line 1 and draws it at that line's TOP
    // edge — above the surviving 'a'. `blockIsAfterEnd` is the bottom edge instead.
    const base = 'a\nb';
    const yours = 'a\nbY';
    const remote = 'a';

    const { mergedYml, decorations } = mergeYamls(yours, base, remote);

    expect(mergedYml).toBe('a');
    expect(decorations).toHaveLength(1);
    expect(decorations[0].options.blockIsAfterEnd).toBe(true);
    expect(decorations[0].range.startLineNumber).toBe(1);
    expect(decorations[0].range.endLineNumber).toBe(1);
  });

  it('keeps a mid-file deletion on the top edge, without blockIsAfterEnd', () => {
    // The counterpart to the case above: a gap with output lines after it is the top edge of
    // the following line, so the bottom-edge opt-in must NOT leak onto every deletion.
    const base = 'a\nb\nc\n';
    const yours = 'a\nbY\nc\n';
    const remote = 'a\nc\n';

    const { decorations } = mergeYamls(yours, base, remote);

    expect(decorations).toHaveLength(1);
    expect(decorations[0].options.blockIsAfterEnd).toBeUndefined();
    expect(decorations[0].range.startLineNumber).toBe(2);
  });

  it('returns the input unchanged when nothing differs', () => {
    const yaml = 'a: 1\nb: 2\n';
    const { mergedYml, decorations } = mergeYamls(yaml, yaml, yaml);

    expect(mergedYml).toBe('a: 1\nb: 2\n');
    expect(decorations).toHaveLength(0);
  });
});
