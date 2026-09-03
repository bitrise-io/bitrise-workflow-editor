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

  it('marks the gap a remote deletion left, positioned by merged-output line', () => {
    // Remote drops the line you changed, so the conflict resolves to an empty region:
    // no output line to outline, only the gap it left. A clean local insertion above it
    // pushes the output past the base, so an input-index anchor drifts.
    // Merged output is 6 lines and 'c' was removed from between 'b' (line 4) and 'd'
    // (line 5), so the gap is the top edge of line 5. Anchoring a line earlier gives 4,
    // a full line too high; anchoring on oIndex gives 3, which is 'NEW2' — your text.
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

  it('anchors a deletion at the top of the file to line 1', () => {
    // The gap sits above the first output line, and the top edge of line 1 is that
    // gap — the lower bound falls out of the anchor, with nothing left to clamp.
    const base = 'a\nb\n';
    const yours = 'aY\nb\n';
    const remote = 'b\n';

    const { decorations } = mergeYamls(yours, base, remote);

    expect(decorations).toHaveLength(1);
    expect(decorations[0].range.startLineNumber).toBe(1);
    expect(decorations[0].range.endLineNumber).toBe(1);
  });

  it('renders a trailing deletion after the last line, not above it', () => {
    // Nothing follows the removed tail, so the gap is below the 1-line output. Left as an
    // out-of-range line 2, Monaco would pull the range back to line 1 and — block decorations
    // positioning from `startLineNumber` alone — draw it at that line's TOP edge, above the
    // surviving 'a' rather than after it. `blockIsAfterEnd` on the last line is the bottom edge.
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
