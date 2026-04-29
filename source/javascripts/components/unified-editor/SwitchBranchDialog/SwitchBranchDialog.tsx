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

import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useBranches } from '@/hooks/useBranches';
import { loadConfigFromBranch, useGetCiConfig } from '@/hooks/useCiConfig';

const SwitchBranchDialog = (props: Omit<DialogProps, 'title'>) => {
  const { isOpen, onClose } = props;

  const [search, setSearch] = useState<string>('');
  const { data, isLoading } = useBranches({ q: search });

  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const [value, setValue] = useState<string>(configBranch || '');
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);

  const {
    isFetching: isLoadingConfig,
    error: configError,
    data: configData,
  } = useGetCiConfig(
    { projectSlug: PageProps.appSlug(), branch: selectedBranch },
    {
      enabled: !!selectedBranch,
    },
  );

  useEffect(() => {
    if (!isLoadingConfig && selectedBranch && configData && !configError) {
      loadConfigFromBranch(selectedBranch);
      bitriseYmlStore.setState({ configBranch: selectedBranch });
      onClose?.();
    }
  }, [isLoadingConfig, selectedBranch, configData, configError, onClose]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSelectedBranch(value);
  };

  return (
    <Dialog title="Switch branch" isOpen={isOpen} onClose={onClose} as="form" onSubmit={handleSubmit}>
      <DialogBody>
        <Text>Load configuration from selected branch.</Text>
        <Dropdown
          label="Branch"
          placeholder="Select branch"
          disabled={isLoading}
          value={value}
          onChange={(e) => setValue(e.target.value ?? '')}
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
        {configError && (
          <Notification status="error" mb="8">
            <Text textStyle="comp/notification/title">Failed to load configuration</Text>
            <Text textStyle="comp/notification/message">
              Could not load bitrise.yml from {selectedBranch}. Check that the file exists on this branch and try again.
            </Text>
          </Notification>
        )}
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoadingConfig}>
          Switch
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default SwitchBranchDialog;
