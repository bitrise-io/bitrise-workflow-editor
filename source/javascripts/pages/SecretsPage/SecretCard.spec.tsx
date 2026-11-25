/**
 * @jest-environment jsdom
 */
import { BitkitProvider } from '@bitrise/bitkit-v2';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Secret } from '@/core/models/Secret';

import SecretCard from './SecretCard';

// The bitkit barrel also exports a markdown component, and `react-markdown`'s ESM dependency tree is
// not transformed for tests. Nothing here renders markdown, so stub it at the leaf.
jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }));

const saveSecret = jest.fn();

jest.mock('@/hooks/useSecrets', () => ({
  useSecretValue: () => ({ data: undefined, isFetching: false }),
  useUpsertSecret: () => ({ mutate: saveSecret, error: null, isPending: false, reset: jest.fn() }),
}));

const NEW_SECRET: Secret = { key: 'API_KEY', value: 'value', isExpand: false, isExpose: false, isEditing: true };

const renderCard = (secret: Secret) =>
  render(
    <BitkitProvider>
      <SecretCard
        appSlug="app-slug"
        secret={secret}
        onEdit={jest.fn()}
        onCancel={jest.fn()}
        onDelete={jest.fn()}
        onSave={jest.fn()}
        isKeyUsed={() => false}
      />
    </BitkitProvider>,
  );

describe('SecretCard', () => {
  afterEach(() => {
    window.localFeatureFlags = {};
    saveSecret.mockClear();
  });

  it('offers the Protected option and saves an unprotected secret as is', async () => {
    renderCard(NEW_SECRET);

    expect(screen.getByRole('checkbox', { name: /Protected/ })).not.toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(saveSecret).toHaveBeenCalledWith(expect.not.objectContaining({ isProtected: true }));
  });

  describe('when protection is enforced', () => {
    beforeEach(() => {
      window.localFeatureFlags = { 'enforce-protected-secrets': true };
    });

    it('saves a new secret as protected, without the option or a confirmation', async () => {
      renderCard(NEW_SECRET);

      expect(screen.queryByRole('checkbox', { name: /Protected/ })).toBeNull();
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(saveSecret).toHaveBeenCalledWith(expect.objectContaining({ key: 'API_KEY', isProtected: true }));
    });

    it('asks for confirmation before protecting an existing unprotected secret', async () => {
      renderCard({ ...NEW_SECRET, isSaved: true, isProtected: false });

      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(saveSecret).not.toHaveBeenCalled();
      await userEvent.click(await screen.findByRole('button', { name: 'Save and protect' }));
      expect(saveSecret).toHaveBeenCalledWith(expect.objectContaining({ key: 'API_KEY', isProtected: true }));
    });
  });
});
