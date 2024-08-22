import { useState } from 'react';
import { Box, Button, Dialog, DialogBody, DialogFooter, EmptyState, Link, Notification, Text } from '@bitrise/bitkit';
import { useMutation } from '@tanstack/react-query';
import { Secret, SecretWithState } from '@/core/models/Secret';
import { monolith } from '@/hooks/api/client';
import SecretCard from './SecretCard';

type SecretsPageProps = {
  secrets: Secret[];
  onSecretsChange: (secrets: Secret[]) => void;
  appSlug: string;
  secretSettingsUrl: string;
  planSelectorPageUrl: string;
  sharedSecretsAvailable: boolean;
  secretsWriteNew: boolean;
};

const SecretsPage = (props: SecretsPageProps) => {
  const {
    secrets,
    onSecretsChange,
    appSlug,
    secretSettingsUrl,
    sharedSecretsAvailable,
    planSelectorPageUrl,
    secretsWriteNew,
  } = props;
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    mutate: deleteSecret,
    isError: deleteError,
    isPending: deleteLoading,
    reset: resetDelete,
  } = useMutation({
    mutationFn: (key: string) => monolith.delete(`/apps/${appSlug}/secrets/${key}`),
    onSuccess(_resp, key) {
      resetDelete();
      afterDelete(key);
    },
  });

  const workspaceSecretList = secrets
    .filter((secret) => secret.isShared)
    .map((secret) => ({ ...secret, isEditing: false, isSaved: true }));

  const [appSecretList, setAppSecretList] = useState<SecretWithState[]>(
    secrets.filter((s) => !s.isShared).map((secret) => ({ ...secret, isEditing: false, isSaved: true })),
  );

  const handleEdit = (id?: string | undefined) => () => {
    setAppSecretList(
      appSecretList.map((secret) => {
        return { ...secret, isEditing: secret.key === id };
      }),
    );
  };

  const handleCancel = () => {
    const newSecretList = appSecretList
      .filter((secret) => secret.isSaved)
      .map((secret) => {
        return { ...secret, isEditing: false };
      });

    setAppSecretList(newSecretList);
  };

  const handleDelete = (id: string | null) => {
    if (id && secretsWriteNew) {
      deleteSecret(id);
    } else {
      afterDelete(id);
    }
  };

  const afterDelete = (id: string | null) => {
    const newAppSecretList = appSecretList.filter((secret) => secret.key !== id);

    setAppSecretList(newAppSecretList);
    onSecretsChange([...workspaceSecretList, ...newAppSecretList]);
    setDeleteId(null);
  };

  const handleSave = (changedSecret: SecretWithState) => {
    const newAppSecretList = appSecretList.map((secret) => {
      return !secret.isSaved || secret.key === changedSecret.key
        ? { ...changedSecret, isEditing: false, isSaved: true }
        : secret;
    });

    setAppSecretList(newAppSecretList);
    onSecretsChange([...workspaceSecretList, ...newAppSecretList]);
  };

  const onAddClick = () => {
    setAppSecretList([
      ...appSecretList,
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
  };

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
              writeSecrets={secretsWriteNew}
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
            writeSecrets={secretsWriteNew}
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
      <Button variant="secondary" leftIconName="PlusAdd" size="md" marginBottom="24" onClick={onAddClick}>
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
