import { BitkitAlert, BitkitButton, BitkitDialog, BitkitSelect } from '@bitrise/bitkit-v2';
import { Text } from '@chakra-ui/react/text';
import { FormEvent, useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import {
  trackBranchSwitchAttempted,
  trackBranchSwitchFailed,
  trackBranchSwitchSucceeded,
} from '@/core/analytics/ConfigManagementAnalytics';
import { initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useBranches } from '@/hooks/useBranches';
import { loadConfigFromBranch, useSwitchBranch } from '@/hooks/useCiConfig';
import useSearchParams from '@/hooks/useSearchParams';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const SwitchBranchDialog = ({ isOpen, onClose }: Props) => {
  const [searchParams] = useSearchParams();
  const limit = searchParams.limit ? Number(searchParams.limit) : undefined;

  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(search, 500);
  const { data, error: getBranchesError, isLoading } = useBranches({ q: debouncedSearch, limit, enabled: isOpen });

  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const [selectedBranch, setSelectedBranch] = useState<string>(configBranch || '');
  const targetBranch = data?.branches.length === 1 ? data.branches[0] : selectedBranch;

  const { isPending: isLoadingConfig, error: switchBranchError, mutateAsync: switchBranch, reset } = useSwitchBranch();

  const filteredBranches = data?.branches
    .map((branch) => ({ value: branch, label: branch }))
    .filter((item) => item.label.toLowerCase().includes(search.toLowerCase()) || item.value === selectedBranch);

  const isSubmitDisabled = isLoading || !data?.branches || !targetBranch || targetBranch === configBranch;

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
          trackBranchSwitchSucceeded(configBranch, targetBranch);
          onClose();
        },
        onError: (error) => {
          trackBranchSwitchFailed(configBranch, targetBranch, error?.message);
        },
      },
    );
  };

  return (
    <BitkitDialog
      title="Switch branch"
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
    >
      {/* TODO: use BitkitDialog.Content asChild  */}
      <form onSubmit={handleSubmit}>
        <BitkitDialog.Body>
          <Text>Load configuration from selected branch.</Text>
          <BitkitSelect
            label="Branch"
            placeholder="Select branch"
            items={filteredBranches || []}
            isLoading={isLoading}
            value={targetBranch}
            onValueChange={setSelectedBranch}
            searchValue={search}
            onSearchChange={setSearch}
          />
          {getBranchesError && <BitkitAlert variant="critical" messageText="Failed to load branches." />}
          {switchBranchError && (
            <BitkitAlert
              variant="critical"
              titleText="Failed to load configuration"
              messageText={`Could not load bitrise.yml from ${targetBranch}. Check that the file exists on this branch and try again.`}
            />
          )}
        </BitkitDialog.Body>
        <BitkitDialog.Footer>
          <BitkitDialog.Buttons>
            <BitkitButton variant="secondary" onClick={onClose}>
              Cancel
            </BitkitButton>
            <BitkitButton
              type="submit"
              state={isLoadingConfig ? 'loading' : isSubmitDisabled ? 'disabled' : undefined}
              onClick={() => trackBranchSwitchAttempted(configBranch, targetBranch)}
            >
              Switch
            </BitkitButton>
          </BitkitDialog.Buttons>
        </BitkitDialog.Footer>
      </form>
    </BitkitDialog>
  );
};

export default SwitchBranchDialog;
