import { Box, Button, Dialog, DialogBody, DialogFooter, EmptyState, Link, Notification, Text } from '@bitrise/bitkit';
import { useCallback, useEffect, useState } from 'react';

import { Secret } from '@/core/models/Secret';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import { useDeleteSecret, useSecrets } from '@/hooks/useSecrets';

import SecretCard from './SecretCard';

const SecretsPage = () => {
  const appSlug = PageProps.appSlug();
  const workspaceSecretsPath = `/workspaces/${GlobalProps.workspaceSlug()}/settings/shared-resources`;
  const planSelectorPath = `/organization/${GlobalProps.workspaceSlug()}/credit_subscription/plan_selector_page`;
  const sharedSecretsAvailable = GlobalProps.workspace()?.sharedResourcesAvailable;

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [appSecretList, setAppSecretList] = useState<Secret[]>([]);
  const [workspaceSecretList, setWorkspaceSecretList] = useState<Secret[]>([]);
  const { data: secrets } = useSecrets({ appSlug });

  useEffect(() => {
    if (secrets) {
      setWorkspaceSecretList(secrets.filter((secret) => secret.isShared));
      setAppSecretList(secrets.filter((secret) => !secret.isShared));
    }
  }, [secrets]);

  const {
    mutate: deleteSecret,
    isError: deleteError,
    isPending: deleteLoading,
    reset: resetDelete,
  } = useDeleteSecret({
    appSlug,
    options: {
      onSuccess: (_, key) => {
        resetDelete();
        setDeleteId(null);
        setAppSecretList((items) => items.filter((secret) => secret.key !== key));
      },
    },
  });

  const handleEdit = useCallback(
    (id?: string | undefined) => () => {
      setAppSecretList((items) =>
        items?.map((secret) => ({
          ...secret,
          isEditing: secret.key === id,
        })),
      );
    },
    [],
  );

  const handleCancel = useCallback(() => {
    setAppSecretList((items) =>
      items.filter((secret) => secret.isSaved).map((secret) => ({ ...secret, isEditing: false })),
    );
  }, []);

  const handleDelete = useCallback(
    (id: string | null) => {
      if (id) {
        deleteSecret(id);
      }
    },
    [deleteSecret],
  );

  const handleSave = useCallback((changedSecret: Secret) => {
    setAppSecretList((items) =>
      items.map((secret) =>
        !secret.isSaved || secret.key === changedSecret.key
          ? { ...changedSecret, isEditing: false, isSaved: true }
          : secret,
      ),
    );
  }, []);

  const onAddClick = useCallback(() => {
    setAppSecretList((items) => [
      ...items,
      {
        key: '',
        value: '',
        isProtected: false,
        isExpand: false,
        isExpose: false,
        isKeyChangeable: false,
        isShared: false,
        isEditing: true,
        isSaved: false,
      },
    ]);
  }, []);

  const sharedSecretsBlock = () => {
    if (!sharedSecretsAvailable) {
      return (
        <Box marginBottom="24" marginTop="8">
          <Link colorScheme="purple" textStyle="body/md/regular" href={planSelectorPath}>
            Upgrade your plan
          </Link>
        </Box>
      );
    }
    return (
      <Box marginY="24">
        {workspaceSecretList.length === 0 && (
          <EmptyState
            title="Your shared secrets will appear here"
            iconName="Lock"
            data-clarity-unmask="true"
            description={
              <Text as="span" textStyle="body/md/regular" textColor="text/secondary">
                Shared resources are managed at Workspace settings
              </Text>
            }
          >
            <Button size="md" variant="secondary" as="a" href={workspaceSecretsPath}>
              Go to Settings
            </Button>
          </EmptyState>
        )}
        {workspaceSecretList.length > 0 &&
          workspaceSecretList.map((secret) => (
            <SecretCard
              appSlug={appSlug}
              key={secret.key}
              secret={secret}
              secretSettingsUrl={workspaceSecretsPath}
              onEdit={handleEdit(secret.key)}
              onCancel={handleCancel}
              onSave={handleSave}
              onDelete={() => setDeleteId(secret.key)}
              isKeyUsed={(key) => appSecretList.filter((s) => s.key !== secret.key).some((s) => s.key === key)}
            />
          ))}
      </Box>
    );
  };

  return (
    <Box p="32">
      <Text as="h2" textStyle="heading/h2" marginBottom="12" data-clarity-unmask="true">
        Secret Environment Variables
      </Text>
      <Text data-clarity-unmask="true">
        Secrets are not shown in the bitrise.yml. They are stored encrypted, and you can prevent them from being exposed
        on the UI by marking them as protected.{' '}
        <Link href="https://docs.bitrise.io/en/bitrise-ci/getting-started/migrating-to-bitrise/migrating-from-jenkins-to-bitrise.html#environment-variables-and-secrets-on-bitrise-94446">
          Learn more
        </Link>
      </Text>
      <Notification status="info" marginY="24" data-clarity-unmask="true">
        <b>We advise not to expose Secrets in pull requests</b> <br />
        Be careful, anyone might be able to implement a workaround and log the value of the Secrets with a pull request.
      </Notification>

      <Text as="h4" textStyle="heading/h4" paddingBottom="8" data-clarity-unmask="true">
        Shared Secrets
      </Text>
      <Text textColor="text/secondary" size="2" data-clarity-unmask="true">
        All projects have access to shared Secrets. If the same Secret is configured at a project level here, it will
        overwrite the shared resource. {sharedSecretsAvailable || '(Available with the Enterprise plans.)'}
      </Text>
      {sharedSecretsBlock()}

      <Text as="h4" textStyle="heading/h4" data-clarity-unmask="true">
        Project level Secrets
      </Text>
      <Box marginTop="16" marginBottom="24">
        {appSecretList.map((secret) => (
          <SecretCard
            appSlug={appSlug}
            key={secret.key}
            secret={secret}
            onEdit={handleEdit(secret.key)}
            onCancel={handleCancel}
            onSave={handleSave}
            onDelete={() => setDeleteId(secret.key)}
            isKeyUsed={(key) =>
              appSecretList
                .filter((s) => !s.isShared)
                .filter((s) => s.key !== secret.key && !secret.isShared)
                .some((s) => s.key === key)
            }
          />
        ))}
      </Box>
      <Button
        variant="secondary"
        leftIconName="PlusCircle"
        size="md"
        marginBottom="24"
        onClick={onAddClick}
        data-clarity-unmask="true"
      >
        Add new
      </Button>

      {/* Tagged per static child rather than on the Dialog, matching the delete workflow / delete
          step bundle dialogs: a future body addition then stays masked until reviewed. */}
      <Dialog title="Delete Secret?" maxWidth="480" isOpen={Boolean(deleteId)} onClose={() => {}}>
        <DialogBody>
          {deleteError && (
            <Notification status="error" data-clarity-unmask="true">
              Error while deleting secret!
            </Notification>
          )}
          <Text data-clarity-unmask="true">
            Make sure to delete this Secret Environment Variable only if you no longer use it in Steps. <br />
            This action cannot be undone.
          </Text>
        </DialogBody>
        <DialogFooter data-clarity-unmask="true">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button isLoading={deleteLoading} isDanger onClick={() => handleDelete(deleteId)}>
            Delete secret
          </Button>
        </DialogFooter>
      </Dialog>
    </Box>
  );
};

export default SecretsPage;
