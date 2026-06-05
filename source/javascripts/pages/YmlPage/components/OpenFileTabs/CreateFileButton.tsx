import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogBody,
  DialogFooter,
  Input,
  Link,
  Radio,
  RadioGroup,
  Select,
  Text,
} from '@bitrise/bitkit';
import { BitkitIconButton, IconPlus } from '@bitrise/bitkit-v2';
import { useMemo, useState } from 'react';

import TreeService from '@/core/services/TreeService';
import { addInclude, createFile, openTab } from '@/core/stores/BitriseYmlStore';
import { useTree } from '@/hooks/useTree';

type Mode = 'create' | 'existing';

/**
 * "Add module file" button (next to "Open module") + its dialog. Two modes:
 *
 *   - Create new file — makes an empty editable module file, opens it in a tab,
 *     and (optionally) adds an `include:` for it to a chosen module. No source
 *     params (a new file has no other source).
 *   - Add existing file — writes an `include:` directive (with optional
 *     repository/branch/tag/commit) into a chosen module; the referenced file is
 *     resolved from Git on the next refresh. No file is created here.
 *
 * Live re-resolution isn't done — the user refreshes after adding an include.
 */
const CreateFileButton = () => {
  const tree = useTree();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('create');
  const [path, setPath] = useState('');
  const [includeInto, setIncludeInto] = useState('');
  const [repository, setRepository] = useState('');
  const [branch, setBranch] = useState('');
  const [tag, setTag] = useState('');
  const [commit, setCommit] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string>();

  // Editable module files are the valid targets for an `include:` directive.
  const editableFiles = useMemo(() => {
    const nodes: { nodeId: string; path: string }[] = [];
    TreeService.walk(tree, (node) => {
      if (node.editable) {
        nodes.push({ nodeId: node.nodeId, path: node.path });
      }
    });
    return nodes;
  }, [tree]);

  const close = () => {
    setIsOpen(false);
    setMode('create');
    setPath('');
    setIncludeInto('');
    setRepository('');
    setBranch('');
    setTag('');
    setCommit('');
    setShowAdvanced(false);
    setError(undefined);
  };

  const clearError = () => setError(undefined);

  const submit = () => {
    if (mode === 'create') {
      // Open the include target first (it stays pinned in the background) so the
      // newly created file ends up the active tab below.
      if (includeInto) {
        openTab(includeInto, { preview: false });
      }
      // Attach the new file under its include target so the backend matches it to
      // the directive instead of fetching it from Git.
      const result = createFile(path, includeInto || undefined);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (includeInto) {
        const included = addInclude(includeInto, { path: path.trim().replace(/^\/+|\/+$/g, '') });
        if (!included.ok) {
          setError(included.error);
          return;
        }
      }
      close();
      return;
    }

    // mode === 'existing'
    if (!includeInto) {
      setError('Select a module file to include into.');
      return;
    }
    const result = addInclude(includeInto, { path, repository, branch, tag, commit });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // Open the module the include was added to so the change is visible.
    openTab(includeInto, { preview: false });
    close();
  };

  return (
    <>
      <BitkitIconButton
        label="Add module file"
        variant="secondary"
        size="sm"
        icon={IconPlus}
        onClick={() => setIsOpen(true)}
      />
      <Dialog isOpen={isOpen} onClose={close} title="Add module file">
        <DialogBody display="flex" flexDir="column" gap="16">
          <RadioGroup
            value={mode}
            onChange={(value) => {
              setMode(value as Mode);
              clearError();
            }}
          >
            <Radio value="create" helperText="Make a new empty module file and open it.">
              Create new file
            </Radio>
            <Radio value="existing" helperText="Include a file that already exists in a repository.">
              Add existing file
            </Radio>
          </RadioGroup>

          <Input
            isRequired
            autoFocus
            value={path}
            label="File path"
            errorText={error}
            placeholder="path/to/my/file.yml"
            helperText="Relative to the repository root."
            leftAddon={
              <Text padding="8px 12px" textStyle="body/md/regular">
                /
              </Text>
            }
            onChange={(e) => {
              setPath(e.target.value);
              clearError();
            }}
          />

          <Select
            label="Include into"
            isRequired={mode === 'existing'}
            placeholder="Select a module file…"
            value={includeInto}
            helperText={
              mode === 'create'
                ? 'Optionally add an include for the new file to this module.'
                : 'The module that will include this file.'
            }
            onChange={(e) => {
              setIncludeInto(e.target.value);
              clearError();
            }}
          >
            {editableFiles.map((file) => (
              <option key={file.nodeId} value={file.nodeId}>
                {TreeService.fileName(file.path)} — {file.path}
              </option>
            ))}
          </Select>

          {mode === 'existing' && (
            <>
              <Link as="button" colorScheme="purple" onClick={() => setShowAdvanced((v) => !v)} alignSelf="flex-start">
                {showAdvanced ? 'Hide source options' : 'Source options (optional)'}
              </Link>
              <Collapse in={showAdvanced} style={{ overflow: 'visible' }}>
                <Box display="flex" flexDir="column" gap="12">
                  <Input
                    label="Repository"
                    placeholder="other-repo-slug"
                    value={repository}
                    helperText="Leave empty to use the same repository."
                    onChange={(e) => {
                      setRepository(e.target.value);
                      clearError();
                    }}
                  />
                  <Input
                    label="Branch"
                    placeholder="main"
                    value={branch}
                    onChange={(e) => {
                      setBranch(e.target.value);
                      clearError();
                    }}
                  />
                  <Input
                    label="Tag"
                    placeholder="v1.2.3"
                    value={tag}
                    onChange={(e) => {
                      setTag(e.target.value);
                      clearError();
                    }}
                  />
                  <Input
                    label="Commit"
                    placeholder="full or short SHA"
                    value={commit}
                    onChange={(e) => {
                      setCommit(e.target.value);
                      clearError();
                    }}
                  />
                </Box>
              </Collapse>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button onClick={submit} isDisabled={!path.trim() || (mode === 'existing' && !includeInto)}>
            {mode === 'create' ? 'Create' : 'Add'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default CreateFileButton;
