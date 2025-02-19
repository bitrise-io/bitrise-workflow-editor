import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogBody, DialogFooter, EmptyState, Link, Notification, Text } from '@bitrise/bitkit';
import { Secret } from '@/core/models/Secret';
import { useDeleteSecret, useSecrets } from '@/hooks/useSecrets';
import WindowUtils from '@/core/utils/WindowUtils';
import SecretCard from './SecretCard';

type SecretsPageProps = {
  onSecretsChange: (secrets: Secret[]) => void;
  sharedSecretsAvailable: boolean;
  // Cleanup
  secretSettingsUrl: string; // TODO - move to react
  planSelectorPageUrl: string; // TODO - move to react
};

const SecretsPage = (props: SecretsPageProps) => {
  const appSlug = WindowUtils.appSlug() ?? '';
  const { onSecretsChange, secretSettingsUrl, sharedSecretsAvailable, planSelectorPageUrl } = props;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [appSecretList, setAppSecretList] = useState<Secret[]>([]);
  const [workspaceSecretList, setWorkspaceSecretList] = useState<Secret[]>([]);
  const { data: secrets = [] } = useSecrets({ appSlug });

  useEffect(() => {
    setWorkspaceSecretList(secrets.filter((secret) => secret.isShared));
    setAppSecretList(secrets.filter((secret) => !secret.isShared));
  }, [secrets, onSecretsChange]);

  useEffect(() => {
    onSecretsChange([...workspaceSecretList, ...appSecretList]);
  }, [workspaceSecretList, appSecretList, onSecretsChange]);

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
          <Link colorScheme="purple" textStyle="body/md/regular" href={planSelectorPageUrl}>
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
            description={
              <Text as="span" textStyle="body/md/regular" textColor="text/secondary">
                Shared resources are managed at Workspace settings
              </Text>
            }
          >
            <Button size="md" variant="secondary" as="a" href={secretSettingsUrl}>
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
              secretSettingsUrl={secretSettingsUrl}
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
    <>
      <Text as="h2" textStyle="heading/h2" marginBottom="12">
        Secret Environment Variables
      </Text>
      <Text>
        Secrets are not shown in the bitrise.yml. They are stored encrypted, and you can prevent them from being exposed
        on the UI by marking them as protected.{' '}
        <Link href="https://devcenter.bitrise.io/en/getting-started/migrating-to-bitrise/migrating-from-jenkins-to-bitrise.html#environment-variables-and-secrets-on-bitrise">
          Learn more
        </Link>
      </Text>
      <Notification status="info" marginY="24">
        <b>We advise not to expose Secrets in pull requests</b> <br />
        Be careful, anyone might be able to implement a workaround and log the value of the Secrets with a pull request.
      </Notification>

      <Text as="h4" textStyle="heading/h4" paddingBottom="8">
        Shared Secrets
      </Text>
      <Text textColor="text/secondary" size="2">
        All projects have access to shared Secrets. If the same Secret is configured at a project level here, it will
        overwrite the shared resource. {sharedSecretsAvailable || '(Available with the Enterprise plans.)'}
      </Text>
      {sharedSecretsBlock()}

      <Text as="h4" textStyle="heading/h4">
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
      <Button variant="secondary" leftIconName="PlusCircle" size="md" marginBottom="24" onClick={onAddClick}>
        Add new
      </Button>

      <Dialog title="Delete Secret?" maxWidth="480" isOpen={Boolean(deleteId)} onClose={() => {}}>
        <DialogBody>
          {deleteError && <Notification status="error">Error while deleting secret!</Notification>}
          <Text>
            Make sure to delete this Secret Environment Variable only if you no longer use it in Steps. <br />
            This action cannot be undone.
          </Text>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button isLoading={deleteLoading} isDanger onClick={() => handleDelete(deleteId)}>
            Delete secret
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default SecretsPage;
