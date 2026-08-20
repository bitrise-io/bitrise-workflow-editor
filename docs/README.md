# Docs

Four documents that describe this repo densely enough that you can rebuild any teaching material
you want from them plus the code.

| Read | To answer |
|---|---|
| [../CLAUDE.md](../CLAUDE.md) | How do I work in this repo? Commands, conventions, where code goes. |
| [DOMAIN.md](DOMAIN.md) | What are the entities, how do they reference each other, what is actually enforced? |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How is the app built? Layers, the store, modular mode, saving, the two runtimes, the Go side. |
| [SUBSYSTEMS.md](SUBSYSTEMS.md) | How does one feature area work? Workflows, steps, pipelines, triggers, bundles, containers, env vars, secrets, stacks, tools. |

Read them in that order once. After that, use `DOMAIN.md` before you design anything that adds an
entity or a cascade, and the other two as lookup.

## How to read a claim

Every statement was checked against the code, and the check is usually in the text. Four markers
carry the weight:

| Marker | Means |
|---|---|
| `> **Rule.**` | Follow this. Going around it breaks something named in the next sentence. |
| `> **Trap.**` | This will cost you an afternoon. `grep -n '\*\*Trap\.\*\*' docs/*.md` lists them. |
| `> **Note.**` | Context worth having, not a rule. |
| `> **Reproduced.**` | Demonstrated with a throwaway test, not inferred from reading. |

Where a doc and the code disagree, **the code wins and the doc is a bug**. This set came out of
auditing the repo against its own `CLAUDE.md`, which turned out to assert three rules the code
never obeyed. The lesson stuck: anything a machine can check is now a lint rule rather than a
sentence, and counts are left out entirely, because a number nobody can reproduce reads as
precision and isn't.

## Generating an onboarding from this

These four documents plus the source are meant to be sufficient input for building whatever
onboarding format you want, and nothing here is written to be read in a browser. A generated
onboarding usually wants:

- **An orientation pass.** One YAML document held as an AST in a Zustand store, edited through
  typed UIs. `DOMAIN.md` section 1 and `ARCHITECTURE.md` opening.
- **An annotated `bitrise.yml`.** Every top-level key is a first-class concept with a model, a
  service and usually a page. `DOMAIN.md` sections 2 and 3 give the map and the entity table.
- **A layer walk.** `ARCHITECTURE.md`, the layer map, including what each layer may not import.
- **Traps, symptom first.** `grep '\*\*Trap\.\*\*'` across both files.
- **Retrieval practice.** Not in these docs, deliberately. Questions are cheap to generate from
  the rules and traps, and they go stale in a way facts do not.

An interactive version built this way is published as the
[Workflow Editor Fieldbook](https://claude.ai/code/artifact/5f772c2b-e81c-42dd-a8af-0a025e06b074),
with a nav rail, search, progress tracking and 89 questions. It is an output of these docs, not a
peer of them. If the two disagree, these win.

## Keeping it true

The set is worth exactly as much as its accuracy, so:

- Change behaviour, change the doc in the same PR. A `> **Rule.**` that no longer holds is worse
  than no rule.
- Add a claim only with the command that checks it. If you cannot state the check, you are
  writing a guess.
- Prefer deleting a stale paragraph to marking it uncertain.

Verified against the repo on 2026-08-20.
