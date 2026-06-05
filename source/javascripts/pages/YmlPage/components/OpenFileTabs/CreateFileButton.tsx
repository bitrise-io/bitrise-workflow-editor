import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogBody,
  DialogFooter,
  Input,
  Link,
  Notification,
  Radio,
  RadioGroup,
  Text,
  Tooltip,
} from '@bitrise/bitkit';
import { BitkitIconButton, IconPlus } from '@bitrise/bitkit-v2';
import { useState } from 'react';

import TreeService from '@/core/services/TreeService';
import { addInclude, createFile } from '@/core/stores/BitriseYmlStore';
import { useFile } from '@/hooks/useFile';
import { useTabs } from '@/hooks/useTabs';

type Mode = 'create' | 'existing';

/**
 * "Add module file" button (next to "Open module") + its dialog. Two modes:
 *
 *   - Create new file — makes an empty editable module file, opens it in a tab,
 *     and adds an `include:` for it to the currently-open file. No source params.
 *   - Add existing file — writes an `include:` directive (with optional
 *     repository/branch/tag/commit) into the currently-open file; the referenced
 *     file is resolved from Git on the next refresh. No file is created here.
 *
 * The included file always goes into the file open in the active tab. The button
 * is disabled on the Merged Config tab (no backing file) and on read-only files.
 */
const CreateFileButton = () => {
  const { activeTab, mergedConfigNodeId } = useTabs();
  const activeFile = useFile(activeTab ?? '');

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('create');
  const [path, setPath] = useState('');
  const [repository, setRepository] = useState('');
  const [branch, setBranch] = useState('');
  const [tag, setTag] = useState('');
  const [commit, setCommit] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string>();

  // The active file is the include target. It must be a real, editable file (not
  // the Merged Config tab, not a read-only cross-ref file).
  const isMerged = activeTab === mergedConfigNodeId;
  const targetNodeId = activeFile?.editable ? activeFile.nodeId : undefined;
  const targetName = activeFile ? TreeService.fileName(activeFile.path) : undefined;

  let disabledReason: string | undefined;
  if (isMerged) {
    disabledReason = 'Switch to a file tab to add a module file — includes are written into the open file.';
  } else if (!targetNodeId) {
    disabledReason = 'This file is read-only, so it cannot include other files. Open an editable file first.';
  }

  const close = () => {
    setIsOpen(false);
    setMode('create');
    setPath('');
    setRepository('');
    setBranch('');
    setTag('');
    setCommit('');
    setShowAdvanced(false);
    setError(undefined);
  };

  const clearError = () => setError(undefined);

  const submit = () => {
    if (!targetNodeId) {
      setError('No editable file is open to include into.');
      return;
    }

    if (mode === 'create') {
      // Attach the new file under its include target so the backend matches it to
      // the directive instead of fetching it from Git.
      const result = createFile(path, targetNodeId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const included = addInclude(targetNodeId, { path: path.trim().replace(/^\/+|\/+$/g, '') });
      if (!included.ok) {
        setError(included.error);
        return;
      }
      close();
      return;
    }

    // mode === 'existing'
    const result = addInclude(targetNodeId, { path, repository, branch, tag, commit });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    close();
  };

  return (
    <>
      <Tooltip label={disabledReason} isDisabled={!disabledReason}>
        {/* The Box gives the tooltip a hover target even when the button is disabled. */}
        <Box>
          <BitkitIconButton
            label="Add module file"
            variant="secondary"
            size="sm"
            icon={IconPlus}
            state={disabledReason ? 'disabled' : undefined}
            onClick={() => setIsOpen(true)}
          />
        </Box>
      </Tooltip>
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

          {targetName && (
            <Text textStyle="body/sm/regular" color="text/secondary">
              Will be added as an{' '}
              <Text as="span" fontWeight="bold">
                include
              </Text>{' '}
              to{' '}
              <Text as="span" fontWeight="bold">
                {targetName}
              </Text>{' '}
              (the open file).
            </Text>
          )}

          {mode === 'existing' && (
            <>
              <Notification status="warning">
                Only the{' '}
                <Text as="span" fontWeight="bold">
                  include
                </Text>{' '}
                directive is added now. The components from this file are picked up and become visible only after you{' '}
                <Text as="span" fontWeight="bold">
                  save
                </Text>{' '}
                your changes.
              </Notification>
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
          <Button onClick={submit} isDisabled={!path.trim()}>
            {mode === 'create' ? 'Create' : 'Add'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default CreateFileButton;
