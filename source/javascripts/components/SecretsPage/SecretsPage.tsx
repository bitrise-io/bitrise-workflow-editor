import { useState } from 'react';
import { Text, Notification, Box, Dialog, DialogBody, Button, DialogFooter } from '@bitrise/bitkit';
import { Secret, SecretWithState } from '../../models';
import SecretCard from './SecretCard';

type SecretsPageProps = {
  secrets: Secret[];
  onSecretsChange: (secrets: Secret[]) => void;
  appSlug: string;
};

const SecretsPage = (props: SecretsPageProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { secrets, onSecretsChange, appSlug } = props;

  const [secretList, setSecretList] = useState<SecretWithState[]>(
    secrets.map((secret) => ({ ...secret, isEditing: false, isSaved: true })),
  );

  const handleEdit = (id?: string | undefined) => () => {
    setSecretList(
      secretList.map((secret) => {
        return { ...secret, isEditing: secret.key === id };
      }),
    );
  };

  const handleCancel = () => {
    const newSecretList = secretList
      .filter((secret) => secret.isSaved)
      .map((secret) => {
        return { ...secret, isEditing: false };
      });

    setSecretList(newSecretList);
  };

  const handleDelete = (id: string | null) => {
    const newSecretList = secretList.filter((secret) => secret.key !== id);

    setSecretList(newSecretList);
    onSecretsChange(newSecretList);
    setDeleteId(null);
  };

  const handleSave = (changedSecret: SecretWithState) => {
    const newSecretList = secretList.map((secret) => {
      return !secret.isSaved || secret.key === changedSecret.key
        ? { ...changedSecret, isEditing: false, isSaved: true }
        : secret;
    });
    setSecretList(newSecretList);
    onSecretsChange(newSecretList);
  };

  const onAddClick = () => {
    setSecretList([
      ...secretList,
      {
        key: '',
        value: '',
        isProtected: false,
        isExpand: false,
        isExpose: false,
        isKeyChangeable: false,

        isEditing: true,
        isSaved: false,
      },
    ]);
  };

  return (
    <>
      <Text as="h2" textStyle="heading/h2" marginBottom="12">
        Secret Environment Variables
      </Text>
      <Text>
        Secrets are not shown in the bitrise.yml. They are stored encrypted, and you can prevent them from being exposed
        on the UI by marking them as protected. Learn more
      </Text>
      <Notification status="info" marginY="24">
        <b>We advise not to expose Secrets in pull requests</b> <br />
        Be careful, anyone might be able to implement a workaround and log the value of the Secrets with a pull request.
      </Notification>
      <Box marginY="24">
        {secretList.map((secret) => (
          <SecretCard
            appSlug={appSlug}
            key={secret.key}
            id={secret.key}
            secret={secret}
            onEdit={handleEdit(secret.key)}
            onCancel={handleCancel}
            onSave={handleSave}
            onDelete={() => setDeleteId(secret.key)}
          />
        ))}
      </Box>
      <Button variant="secondary" leftIconName="PlusAdd" size="md" marginBottom="24" onClick={onAddClick}>
        Add new
      </Button>

      <Dialog title="Delete Secret" maxWidth="480" isOpen={!!deleteId} onClose={() => {}}>
        <DialogBody>
          <Text>Are you sure you want to delete this Secret? This cannot be undone once saved.</Text>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button isDanger onClick={() => handleDelete(deleteId)}>
            Delete secret
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog title="Delete Secret?" maxWidth="480" isOpen={!!deleteId} onClose={() => {}}>
        <DialogBody>
          <Text>
            Make sure to delete this Secret Environment Variable only if you no longer use it in Steps. <br />
            This action cannot be undone.
          </Text>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button isDanger onClick={() => handleDelete(deleteId)}>
            Delete secret
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default SecretsPage;
