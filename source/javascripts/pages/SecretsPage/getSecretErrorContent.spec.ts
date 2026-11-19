import { ClientError } from '@/core/api/client';

import getSecretErrorContent from './getSecretErrorContent';

const clientError = (status: number, data?: Record<string, string>) =>
  new ClientError(new Error('request failed'), { status } as unknown as Response, data);

describe('getSecretErrorContent', () => {
  it('shows the storage limit message with a support action', () => {
    const content = getSecretErrorContent(
      clientError(422, {
        code: 'secrets_size_limit_exceeded',
        error_msg: 'Validation failed: Secrets can take up 100KB in total.',
      }),
      'save',
    );

    expect(content.titleText).toBe('Secrets storage limit reached');
    expect(content.messageText).toBe('Secrets can take up 100KB in total.');
    expect(content.action?.label).toBe('Contact support');
  });

  it('shows the validation message without the ActiveRecord prefix', () => {
    const content = getSecretErrorContent(
      clientError(422, { error_msg: 'Validation failed: Name opts is reserved. Choose a different name.' }),
      'save',
    );

    expect(content).toEqual({
      titleText: "Couldn't save the Secret",
      messageText: 'Name opts is reserved. Choose a different name.',
    });
  });

  it('explains a missing secret or permission on 404', () => {
    const content = getSecretErrorContent(clientError(404, { error_msg: 'Not Found' }), 'delete');

    expect(content.titleText).toBe("Couldn't delete the Secret");
    expect(content.messageText).toMatch(/Reload the page and try again/);
    expect(content.action).toBeUndefined();
  });

  it('falls back to a retry message with a support action', () => {
    expect(getSecretErrorContent(clientError(500), 'save')).toMatchObject({
      titleText: "Couldn't save the Secret",
      messageText: 'Please try again. If the problem still persists, contact support.',
      action: { label: 'Contact support' },
    });
    expect(getSecretErrorContent(new Error('Network error'), 'save').action?.label).toBe('Contact support');
  });
});
