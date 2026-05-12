import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogProps,
  Dropdown,
  DropdownOption,
  DropdownSearch,
  Notification,
  Text,
} from '@bitrise/bitkit';
import { FormEvent, useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useBranches } from '@/hooks/useBranches';
import { loadConfigFromBranch, useSwitchBranch } from '@/hooks/useCiConfig';

const SwitchBranchDialog = (props: Omit<DialogProps, 'title'>) => {
  const { isOpen, onClose } = props;

  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(search, 500);
  const { data, error: getBranchesError, isLoading } = useBranches({ q: debouncedSearch, enabled: isOpen });

  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const [selectedBranch, setSelectedBranch] = useState<string>(configBranch || '');
  const targetBranch = data?.branches.length === 1 ? data.branches[0] : selectedBranch;

  const { isPending: isLoadingConfig, error: switchBranchError, mutateAsync: switchBranch, reset } = useSwitchBranch();

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedBranch(configBranch || '');
      reset();
    }
  }, [configBranch, isOpen, reset]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await switchBranch(
      { projectSlug: PageProps.appSlug(), branch: targetBranch },
      {
        onSuccess: (data) => {
          initializeBitriseYmlDocument({ ...data, branch: data.branch || targetBranch });
          loadConfigFromBranch(targetBranch);
          segmentTrack('Branch Switch Succeeded', {
            app_slug: PageProps.appSlug(),
            workspace_slug: GlobalProps.workspaceSlug(),
            // git_provider,
            current_branch: configBranch,
            requested_branch: targetBranch,
            default_branch: PageProps.app()?.defaultBranch,
          });
          onClose?.();
        },
        onError: () => {
          segmentTrack('Branch Switch Failed', {
            app_slug: PageProps.appSlug(),
            workspace_slug: GlobalProps.workspaceSlug(),
            // git_provider,
            current_branch: configBranch,
            requested_branch: targetBranch,
            default_branch: PageProps.app()?.defaultBranch,
            error_reason: switchBranchError?.message,
          });
        },
      },
    );
  };

  return (
    <Dialog title="Switch branch" isOpen={isOpen} onClose={onClose} as="form" onSubmit={handleSubmit}>
      <DialogBody>
        <Text>Load configuration from selected branch.</Text>
        <Dropdown
          label="Branch"
          placeholder="Select branch"
          disabled={isLoading}
          value={targetBranch}
          onChange={(e) => setSelectedBranch(e.target.value ?? '')}
          required
          search={<DropdownSearch placeholder="Search..." value={search} onChange={setSearch} />}
          mt="24"
        >
          {data?.branches.map((branch) => (
            <DropdownOption key={branch} value={branch}>
              {branch}
            </DropdownOption>
          ))}
        </Dropdown>
      </DialogBody>
      <DialogFooter>
        {switchBranchError && (
          <Notification status="error" mb="8">
            <Text textStyle="comp/notification/title">Failed to load configuration</Text>
            <Text textStyle="comp/notification/message">
              Could not load bitrise.yml from {targetBranch}. Check that the file exists on this branch and try again.
            </Text>
          </Notification>
        )}
        {getBranchesError && (
          <Notification status="error" mb="8">
            <Text textStyle="comp/notification/message">Failed to load branches.</Text>
          </Notification>
        )}
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoadingConfig}
          isDisabled={isLoading || !data?.branches || data.branches.length === 1}
          onClick={() => {
            segmentTrack('Branch Switch Attempted', {
              app_slug: PageProps.appSlug(),
              workspace_slug: GlobalProps.workspaceSlug(),
              // git_provider,
              current_branch: configBranch,
              requested_branch: targetBranch,
              default_branch: PageProps.app()?.defaultBranch,
            });
          }}
        >
          Switch
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default SwitchBranchDialog;
