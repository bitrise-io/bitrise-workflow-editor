import * as monaco from 'monaco-editor';
import { useEffect } from 'react';
import { Document } from 'yaml';

import { bitriseYmlStore, getYmlString, openTab, setValidationStatus } from '@/core/stores/BitriseYmlStore';
import { buildNodeUris, ROOT_MODEL_URI } from '@/core/utils/lspModelUris';
import MonacoUtils from '@/core/utils/MonacoUtils';
import YmlUtils from '@/core/utils/YmlUtils';
import useFeatureFlag from '@/hooks/useFeatureFlag';

/** Root config model URI. Kept for the single-file (non-modular) editor, now on the bitrise:// scheme. */
export const BACKGROUND_MODEL_URI = monaco.Uri.parse(ROOT_MODEL_URI);

/** One entry per file the language service should see, keyed by its bitrise:// URI. */
type DesiredModel = { uri: string; content: string };

// Serialized YAML keyed by document identity. The store clones the document on every mutation
// (only the edited file gets a fresh Document), so on each keystroke exactly one file misses this
// cache and re-serializes; the untouched include files return their cached string. WeakMap ⇒ the
// entry is collected with the document, no invalidation needed.
const ymlStringByDocument = new WeakMap<Document, string>();
function toYmlCached(doc: Document): string {
  let content = ymlStringByDocument.get(doc);
  if (content === undefined) {
    content = YmlUtils.toYml(doc);
    ymlStringByDocument.set(doc, content);
  }
  return content;
}

/**
 * The files the language service should see as one workspace: every include-tree file (modular
 * config), or the single root document (non-modular). URIs are bitrise:// so include links and
 * cross-file symbols resolve by exact-string match against the targets core computes.
 */
function desiredModels(state = bitriseYmlStore.getState()): DesiredModel[] {
  const { tree, files } = state;
  if (!tree) {
    return [{ uri: ROOT_MODEL_URI, content: getYmlString() }];
  }

  const uriByNode = buildNodeUris(tree);
  return Object.values(files).flatMap((file) => {
    const uri = uriByNode.get(file.nodeId);
    return uri ? [{ uri, content: toYmlCached(file.ymlDocument) }] : [];
  });
}

/**
 * The bitrise:// URI of the root config model — the whole-config document. In modular mode the root
 * node inherits the working repo; without a tree it's the single non-modular document.
 */
function rootModelUri(state = bitriseYmlStore.getState()): string {
  const { tree } = state;
  if (!tree) return ROOT_MODEL_URI;
  return buildNodeUris(tree).get(tree.nodeId) ?? ROOT_MODEL_URI;
}

/** The tree node whose bitrise:// model URI equals `uri`, or undefined (merged/unknown/non-modular). */
function nodeIdForUri(uri: string): string | undefined {
  const { tree } = bitriseYmlStore.getState();
  if (!tree) return undefined;
  for (const [nodeId, nodeUri] of buildNodeUris(tree)) {
    if (nodeUri === uri) return nodeId;
  }
  return undefined;
}

/** Coerce the opener's target (a range, a bare position, or nothing) into a range to reveal. */
function toRange(
  source: monaco.editor.ICodeEditor,
  selectionOrPosition?: monaco.IRange | monaco.IPosition,
): monaco.IRange {
  if (!selectionOrPosition) {
    return source.getSelection() ?? { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 };
  }
  if ('startLineNumber' in selectionOrPosition) return selectionOrPosition;
  const { lineNumber, column } = selectionOrPosition;
  return { startLineNumber: lineNumber, startColumn: column, endLineNumber: lineNumber, endColumn: column };
}

function revealInEditor(editor: monaco.editor.ICodeEditor, range: monaco.IRange) {
  editor.setSelection(range);
  editor.revealRangeInCenterIfOutsideViewport(range);
  editor.focus();
}

// After a tab switch the target file's editor mounts asynchronously (React re-render + model swap),
// so poll frames for the editor now showing that model, then reveal. Bounded so a target that never
// mounts (e.g. tab open was blocked) can't spin forever — but generous (~1s of frames) so a slow or
// large file that just takes a while to mount still gets its range revealed instead of silently
// landing the user at line 1.
const REVEAL_MAX_ATTEMPTS = 60;
function revealWhenReady(uri: string, range: monaco.IRange, attempts = 0) {
  const editor = monaco.editor.getEditors().find((e) => e.getModel()?.uri.toString() === uri);
  if (editor) {
    revealInEditor(editor, range);
  } else if (attempts < REVEAL_MAX_ATTEMPTS) {
    requestAnimationFrame(() => revealWhenReady(uri, range, attempts + 1));
  }
}

function useYmlLanguageServices() {
  const enableBitriseLsp = useFeatureFlag('enable-wfe-bitrise-lsp-integration');

  useEffect(() => {
    // Configure Monaco language services (idempotent — safe to call multiple times)
    MonacoUtils.configureForYaml(monaco);
    MonacoUtils.configureEnvVarsCompletionProvider(monaco);
    // The Bitrise LSP integration runs a Monaco worker that queries Algolia (steplib_steps)
    // on every document change for diagnostics/completion/hover. Gate it behind a flag so it
    // can be disabled without a deploy. When off, editing falls back to plain monaco-yaml.
    if (enableBitriseLsp) {
      MonacoUtils.configureBitriseLanguageServer(monaco);
    }

    // URIs of the models we own, so a reconcile can dispose ones whose file left the tree. Models
    // are shared with the editor components (same URI ⇒ same Monaco model), so the worker analyzes
    // exactly what the user sees and edits.
    const ownedUris = new Set<string>();

    const upsertModel = (uri: string, content: string, forceSync: boolean) => {
      const resource = monaco.Uri.parse(uri);
      ownedUris.add(uri);

      const model = monaco.editor.getModel(resource);
      if (!model) {
        monaco.editor.createModel(content, 'yaml', resource);
        return;
      }
      if (model.getValue() === content) return;

      // The model bound to the active editor is driven by the user's keystrokes (which already flow
      // to the store), so syncing it would clobber cursor/undo with round-tripped text. On
      // discard/external-init the store is authoritative — sync it too, but deferred past React's
      // render so Monaco's in-flight work on the unmounting editor isn't canceled.
      if (model.isAttachedToEditor()) {
        if (forceSync) {
          requestAnimationFrame(() => {
            if (!model.isDisposed() && model.getValue() !== content) model.setValue(content);
          });
        }
        return;
      }
      model.setValue(content);
    };

    const reconcile = (forceSync: boolean) => {
      const desired = desiredModels();
      const desiredUris = new Set(desired.map((d) => d.uri));
      desired.forEach((d) => upsertModel(d.uri, d.content, forceSync));

      // Dispose models we own whose file left the tree — but never one still on screen; a disposed
      // model would break its editor. (An open file being removed from the tree isn't expected.)
      ownedUris.forEach((uri) => {
        if (desiredUris.has(uri)) return;
        const model = monaco.editor.getModel(monaco.Uri.parse(uri));
        if (model && !model.isAttachedToEditor()) {
          model.dispose();
          ownedUris.delete(uri);
        }
      });
    };

    reconcile(true);

    // Global validation status (drives Save gating + the validation badge — NOT the editor-view
    // redirect, which keys off a genuine parse failure via useIsYmlParseError) tracks the ROOT config
    // model only. Aggregating markers across every include model would trap the user: an include fragment
    // (e.g. a workflows-only module) has no format_version/include, so monaco-yaml's whole-config
    // schema — registered with fileMatch ['*'], so it hits every bitrise:// model — reports an
    // anyOf error on it. That would flip the config to `invalid` and bounce the user off the visual
    // editor even though the merged config is valid. The root model resolves cross-file references
    // (the LS treats the tree as one workspace), so genuine cross-file breakage still surfaces here;
    // per-file syntax errors remain visible in each file's own editor.
    const markerDisposable = MonacoUtils.onWorkspaceMarkerStatusChange(() => {
      const model = monaco.editor.getModel(monaco.Uri.parse(rootModelUri()));
      return model ? [model] : [];
    }, setValidationStatus);

    // Cross-file navigation for the code editor: Go-to-Definition and include-link clicks hand Monaco
    // a target model URI, but a standalone editor can't switch files on its own. Map the bitrise://
    // target back to its tree node, open that file's tab, and reveal the range once its editor mounts.
    // (In-file navigation — including the isolated merged preview — is the same-model branch.)
    // Not gated behind enableBitriseLsp: the cross-file targets it acts on are produced by the LS's
    // definition/reference/link providers, which only exist when the flag is on. With the flag off no
    // such target is ever handed to the opener, so registering it unconditionally is inert.
    const openerDisposable = monaco.editor.registerEditorOpener({
      openCodeEditor(source, resource, selectionOrPosition) {
        const uri = resource.toString();
        const range = toRange(source, selectionOrPosition);

        if (source.getModel()?.uri.toString() === uri) {
          revealInEditor(source, range);
          return true;
        }

        const nodeId = nodeIdForUri(uri);
        if (!nodeId) return false; // not one of our tree models — let Monaco's default handling run
        openTab(nodeId, { preview: false });
        revealWhenReady(uri, range);
        return true;
      },
    });

    // Keep the models in sync when changes come from outside the editor (visual editor pages,
    // discard, external init, or files being added/removed in the modular tree).
    const unsubscribeStore = bitriseYmlStore.subscribe(
      (state) => ({
        ymlDocument: state.ymlDocument,
        savedYmlDocument: state.savedYmlDocument,
        invalidYmlString: state.__invalidYmlString,
        savedInvalidYmlString: state.__savedInvalidYmlString,
        discardKey: state.discardKey,
        tree: state.tree,
        files: state.files,
      }),
      (curr, prev) => {
        const isDiscard = curr.discardKey !== prev.discardKey;
        const isExternalInit =
          curr.savedYmlDocument !== prev.savedYmlDocument || curr.savedInvalidYmlString !== prev.savedInvalidYmlString;
        reconcile(isDiscard || isExternalInit);
      },
      {
        equalityFn: (a, b) =>
          a.ymlDocument === b.ymlDocument &&
          a.savedYmlDocument === b.savedYmlDocument &&
          a.invalidYmlString === b.invalidYmlString &&
          a.savedInvalidYmlString === b.savedInvalidYmlString &&
          a.discardKey === b.discardKey &&
          a.tree === b.tree &&
          a.files === b.files,
      },
    );

    return () => {
      markerDisposable.dispose();
      openerDisposable.dispose();
      unsubscribeStore();
      // NOTE: We intentionally do NOT dispose the models here.
      // They must survive effect re-runs (including React Strict Mode double-mount)
      // because configureMonacoYaml / configureBitriseYaml run async workers on them.
      // Disposing while workers are in-flight causes "Model is disposed" errors.
      // Models live for the entire app session — monaco.editor.getModel() reuses them.
    };
  }, [enableBitriseLsp]);
}

export default useYmlLanguageServices;
