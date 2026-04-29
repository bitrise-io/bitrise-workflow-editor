import { Button, Dialog, DialogBody, DialogFooter, DialogProps, Notification, Select, Text } from '@bitrise/bitkit';
import { FormEvent, useEffect, useState } from 'react';

import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useBranches } from '@/hooks/useBranches';
import { loadConfigFromBranch, useGetCiConfig } from '@/hooks/useCiConfig';

const SwitchBranchDialog = (props: Omit<DialogProps, 'title'>) => {
  const { isOpen, onClose } = props;
  const { data, isLoading } = useBranches();
  const configBranch = useBitriseYmlStore((s) => s.configBranch);
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
    const branch = new FormData(e.currentTarget).get('branch') as string;
    setSelectedBranch(branch);
  };

  return (
    <Dialog title="Switch branch" isOpen={isOpen} onClose={onClose} as="form" onSubmit={handleSubmit}>
      <DialogBody>
        <Text>Load configuration from selected branch.</Text>
        <Select
          name="branch"
          label="Branch"
          placeholder="Select branch"
          isRequired
          mt="24"
          isDisabled={isLoading}
          defaultValue={configBranch}
        >
          {data?.branches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </Select>
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
