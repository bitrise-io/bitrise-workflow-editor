import { Card, Dialog, DialogBody, DialogFooter } from '@bitrise/bitkit';
import { BitkitAlert, BitkitButton, BitkitLink, IconPlus } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { useCallback, useEffect, useState } from 'react';

import ToolPageHeading from '@/components/Navigation/ToolPageHeading';
import TabHeader from '@/components/tabs/TabHeader';
import { Secret } from '@/core/models/Secret';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import { useDeleteSecret, useSecrets } from '@/hooks/useSecrets';

import SecretCard, { hasRowActions, secretRowGrid } from './SecretCard';

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

  const tableHeader = (hasActionsColumn: boolean) => (
    <Box
      as="header"
      {...secretRowGrid(hasActionsColumn)}
      height="48"
      alignItems="center"
      textStyle="heading/h5"
      borderBottom="1px solid"
      borderColor="border/minimal"
      data-clarity-unmask="true"
    >
      <Text as="span">Key</Text>
      <span />
      <Text as="span">Value</Text>
    </Box>
  );

  const renderRow = (secret: Secret, hasActionsColumn: boolean, isKeyUsed: (key: string) => boolean) => (
    <SecretCard
      appSlug={appSlug}
      key={secret.key}
      secret={secret}
      secretSettingsUrl={secret.isShared ? workspaceSecretsPath : undefined}
      onEdit={handleEdit(secret.key)}
      onCancel={handleCancel}
      onSave={handleSave}
      onDelete={() => setDeleteId(secret.key)}
      isKeyUsed={isKeyUsed}
      hasActionsColumn={hasActionsColumn}
    />
  );

  // Shown in place of rows when a table is empty, like the Env Vars tables' empty text.
  const emptyRow = (text: string, link?: { href: string; label: string }) => (
    <Text
      paddingInline="32"
      paddingBlock="16"
      textStyle="body/md/regular"
      color="text/secondary"
      borderBottom="1px solid"
      borderColor="border/minimal"
      data-clarity-unmask="true"
    >
      {text}{' '}
      {link && (
        <BitkitLink colorVariant="purple" href={link.href}>
          {link.label}
        </BitkitLink>
      )}
    </Text>
  );

  const projectHasActions = appSecretList.some(hasRowActions);
  const sharedHasActions = workspaceSecretList.some(hasRowActions);

  return (
    <>
      <ToolPageHeading
        label="Secret Environment Variables"
        helperText={
          <>
            Secrets are not shown in the bitrise.yml. They are stored encrypted, and you can prevent them from being
            exposed on the UI by marking them as protected.{' '}
            <BitkitLink
              colorVariant="purple"
              href="https://docs.bitrise.io/en/bitrise-ci/getting-started/migrating-to-bitrise/migrating-from-jenkins-to-bitrise.html#environment-variables-and-secrets-on-bitrise-94446"
              isExternal
            >
              Learn more
            </BitkitLink>
          </>
        }
      />
      <Box paddingInline="32" paddingBlockEnd="32" display="flex" flexDirection="column" gap="32">
        <BitkitAlert
          variant="info"
          data-clarity-unmask="true"
          titleText="We advise not to expose Secrets in pull requests"
          messageText="Be careful, anyone might be able to implement a workaround and log the value of the Secrets with a pull request."
        />

        {/* Like the Env Vars page: a section header, then one table of key = value rows. */}
        <Box display="flex" flexDirection="column" gap="16">
          <TabHeader
            title="Project Secrets"
            subtitle="Available in this project's builds. They're stored encrypted and never shown in the bitrise.yml."
          />
          <Card as="section" variant="outline" overflow="hidden">
            {tableHeader(projectHasActions)}
            {appSecretList.length === 0 && emptyRow('No Secrets yet.')}
            {appSecretList.map((secret) =>
              renderRow(secret, projectHasActions, (key) =>
                appSecretList.filter((s) => !s.isShared && s.key !== secret.key).some((s) => s.key === key),
              ),
            )}
            <Box paddingInline="16" paddingBlock="12">
              <BitkitButton
                size="md"
                variant="tertiary"
                icon={IconPlus}
                onClick={onAddClick}
                data-clarity-unmask="true"
              >
                Add new
              </BitkitButton>
            </Box>
          </Card>
        </Box>

        <Box display="flex" flexDirection="column" gap="16">
          <TabHeader
            title="Shared Secrets"
            subtitle="All projects of the Workspace can use them. A project Secret with the same key overrides the shared one."
          />
          <Card as="section" variant="outline" overflow="hidden">
            {tableHeader(sharedHasActions)}
            {!sharedSecretsAvailable &&
              emptyRow('Shared Secrets are available with the Enterprise plans.', {
                href: planSelectorPath,
                label: 'Upgrade your plan',
              })}
            {sharedSecretsAvailable &&
              workspaceSecretList.length === 0 &&
              emptyRow('Shared Secrets are managed at Workspace settings and appear here.', {
                href: workspaceSecretsPath,
                label: 'Go to settings',
              })}
            {sharedSecretsAvailable &&
              workspaceSecretList.map((secret) =>
                renderRow(secret, sharedHasActions, (key) =>
                  appSecretList.filter((s) => s.key !== secret.key).some((s) => s.key === key),
                ),
              )}
          </Card>
        </Box>

        {/* Tagged per static child rather than on the Dialog, matching the delete workflow / delete
          step bundle dialogs: a future body addition then stays masked until reviewed. */}
        <Dialog title="Delete Secret?" maxWidth="480" isOpen={Boolean(deleteId)} onClose={() => {}}>
          <DialogBody>
            {deleteError && (
              <BitkitAlert variant="critical" data-clarity-unmask="true" messageText="Error while deleting secret!" />
            )}
            <Text data-clarity-unmask="true">
              Make sure to delete this Secret Environment Variable only if you no longer use it in Steps. <br />
              This action cannot be undone.
            </Text>
          </DialogBody>
          <DialogFooter data-clarity-unmask="true">
            <BitkitButton variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </BitkitButton>
            <BitkitButton
              variant="danger-primary"
              state={deleteLoading ? 'loading' : undefined}
              onClick={() => handleDelete(deleteId)}
            >
              Delete secret
            </BitkitButton>
          </DialogFooter>
        </Dialog>
      </Box>
    </>
  );
};

export default SecretsPage;
