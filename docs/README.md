# Docs

The editor holds **one YAML document** as an AST in a Zustand store and lets people edit it
through a dozen typed UIs instead of a text box. Nothing else is state of record. Pages read from
the document, services mutate it, the Go server validates and persists it.

Internalise that sentence and most of the codebase stops being surprising. The rest of these docs
cover what you cannot work out by reading the source.

| Read | To answer | Words |
|---|---|---|
| [FLOWS.md](FLOWS.md) | How does a change actually travel through the app? Seven paths, with diagrams. | ~1,600 |
| [DOMAIN.md](DOMAIN.md) | What are the entities, how do they reference each other, what is enforced? | ~3,000 |
| [DECISIONS.md](DECISIONS.md) | Why is it built this way, and what will bite me? | ~2,300 |
| [../CLAUDE.md](../CLAUDE.md) | Where does my code go? Commands and conventions. | ~2,500 |

**New here?** FLOWS 1 and 2, then DOMAIN sections 1 to 3. That is about twenty minutes and enough
to start work. Come back for the rest when something surprises you.

**An agent starting a session** should load CLAUDE.md and DOMAIN.md, and reach for FLOWS or
DECISIONS when a change touches the store, modular mode, saving or the YAML tab.

## What is deliberately not here

Anything you can discover faster than you can look it up. Service surfaces, model fields, file
maps, which components exist: read the code, it is right there and it does not go stale. Counts
of any kind are also out, because a number nobody can reproduce reads as precision and is not.

What is here is the two things the source cannot tell you: the **rationale** behind a shape, and
the **hazards** that only show up at runtime.

## Reading a claim

| Marker | Means |
|---|---|
| `> **Rule.**` | Follow it. Going around it breaks something named in the next sentence. |
| `> **Trap.**` | This will cost you an afternoon. `grep -rn '\*\*Trap\.\*\*' docs/` lists them all. |
| `> **Note.**` | Context, not a rule. |
| `> **Reproduced.**` | Demonstrated with a throwaway test, not inferred from reading. |

Where a doc and the code disagree, **the code wins and the doc is a bug**. This set came out of
auditing the repo against its own `CLAUDE.md`, which asserted three rules the code had never
obeyed, one of them a lint rule that was never enabled. So anything a machine can check is a lint
rule now rather than a sentence:

```
core/ may not import react or react-dom      .tsx may not call updateBitriseYmlDocument
useShallow comes from @/hooks/useShallow     raw useStore may not build a fresh value
```

Break one and `npm run lint` fails. That is the only kind of documentation that cannot rot.

## Keeping it true

Change behaviour, change the doc in the same PR. A `> **Rule.**` that no longer holds is worse
than no rule at all. Add a claim only with the check that backs it, and prefer deleting a stale
paragraph to hedging it.
