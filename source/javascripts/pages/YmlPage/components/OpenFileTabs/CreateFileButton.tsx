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
} from '@bitrise/bitkit';
import { BitkitIconButton, IconPlus } from '@bitrise/bitkit-v2';
import { useState } from 'react';

import TreeService from '@/core/services/TreeService';
import { addInclude, createFile } from '@/core/stores/BitriseYmlStore';
import { useFile } from '@/hooks/useFile';
import { useTabs } from '@/hooks/useTabs';

type Mode = 'create' | 'existing';

type FormState = {
  mode: Mode;
  path: string;
  repository: string;
  branch: string;
  tag: string;
  commit: string;
};

const EMPTY_FORM: FormState = { mode: 'create', path: '', repository: '', branch: '', tag: '', commit: '' };

const SOURCE_FIELDS = [
  {
    key: 'repository',
    label: 'Repository',
    placeholder: 'other-repo-slug',
    helperText: 'Leave empty to use the same repository.',
  },
  { key: 'branch', label: 'Branch', placeholder: 'main' },
  { key: 'tag', label: 'Tag', placeholder: 'v1.2.3' },
  { key: 'commit', label: 'Commit', placeholder: 'full or short SHA' },
] as const;

const CreateFileButton = () => {
  const { activeTab, mergedConfigNodeId } = useTabs();
  const activeFile = useFile(activeTab ?? '');

  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string>();

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(undefined);
  };

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
    setShowAdvanced(false);
    setForm(EMPTY_FORM);
    setError(undefined);
  };

  const submit = () => {
    if (!targetNodeId) {
      setError('No editable file is open to include into.');
      return;
    }

    if (form.mode === 'create') {
      // Attach under the include target so the backend matches it to the directive instead of fetching from Git.
      const result = createFile(form.path, targetNodeId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const included = addInclude(targetNodeId, { path: form.path });
      if (!included.ok) {
        setError(included.error);
        return;
      }
      close();
      return;
    }

    const { mode: _mode, ...source } = form;
    const result = addInclude(targetNodeId, source);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    close();
  };

  return (
    <>
      <BitkitIconButton
        label={disabledReason || 'Add module file'}
        variant="secondary"
        size="sm"
        icon={IconPlus}
        state={disabledReason ? 'disabled' : undefined}
        onClick={() => setIsOpen(true)}
      />
      <Dialog isOpen={isOpen} onClose={close} title="Add module file">
        <DialogBody display="flex" flexDir="column" gap="16">
          <RadioGroup value={form.mode} onChange={(value) => setField('mode', value as Mode)}>
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
            value={form.path}
            label="File path"
            errorText={error}
            placeholder="path/to/my/file.yml"
            helperText="Relative to the repository root."
            leftAddon={
              <Text padding="8px 12px" textStyle="body/md/regular">
                /
              </Text>
            }
            onChange={(e) => setField('path', e.target.value)}
          />

          {targetName && (
            <Text textStyle="body/sm/regular" color="text/secondary">
              Will be added as an{' '}
              <Text as="span" textStyle="body/sm/semibold">
                include
              </Text>{' '}
              to{' '}
              <Text as="span" textStyle="body/sm/semibold">
                {targetName}
              </Text>{' '}
              (the open file).
            </Text>
          )}

          {form.mode === 'existing' && (
            <>
              <Notification status="warning">
                Only the{' '}
                <Text as="span" textStyle="body/md/semibold">
                  include
                </Text>{' '}
                directive is added now. The components from this file are picked up and become visible only after you{' '}
                <Text as="span" textStyle="body/md/semibold">
                  save
                </Text>{' '}
                your changes.
              </Notification>
              <Link as="button" colorScheme="purple" onClick={() => setShowAdvanced((v) => !v)} alignSelf="flex-start">
                {showAdvanced ? 'Hide source options' : 'Source options (optional)'}
              </Link>
              <Collapse in={showAdvanced} style={{ overflow: 'visible' }}>
                <Box display="flex" flexDir="column" gap="12">
                  {SOURCE_FIELDS.map(({ key, ...inputProps }) => (
                    <Input
                      key={key}
                      value={form[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      {...inputProps}
                    />
                  ))}
                </Box>
              </Collapse>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button onClick={submit} isDisabled={!form.path.trim()}>
            {form.mode === 'create' ? 'Create' : 'Add'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default CreateFileButton;
