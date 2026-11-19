import { ClientError } from '@/core/api/client';

const CONTACT_SUPPORT_ACTION = {
  label: 'Contact support',
  href: 'https://bitrise.io/contact',
  isExternal: true,
};

const SIZE_LIMIT_EXCEEDED = 'secrets_size_limit_exceeded';

export type SecretOperation = 'save' | 'delete';

export type SecretErrorContent = {
  titleText: string;
  messageText: string;
  action?: typeof CONTACT_SUPPORT_ACTION;
};

const getSecretErrorContent = (error: Error, operation: SecretOperation): SecretErrorContent => {
  const titleText = operation === 'save' ? "Couldn't save the Secret" : "Couldn't delete the Secret";
  const clientError = error instanceof ClientError ? error : undefined;
  const serverMessage = clientError?.getResponseErrorMessage()?.replace(/^Validation failed: /, '');

  if (clientError?.data?.code === SIZE_LIMIT_EXCEEDED) {
    return {
      titleText: 'Secrets storage limit reached',
      messageText:
        serverMessage ||
        'Your Secrets reached the maximum total size. Delete Secrets you no longer use, or contact support to raise the limit.',
      action: CONTACT_SUPPORT_ACTION,
    };
  }

  if (clientError?.status === 404) {
    return {
      titleText,
      messageText:
        "You don't have permission to change this project's Secrets, or the Secret no longer exists. Reload the page and try again.",
    };
  }

  if (clientError?.status === 422 && serverMessage) {
    return { titleText, messageText: serverMessage };
  }

  return {
    titleText,
    messageText: 'Please try again. If the problem still persists, contact support.',
    action: CONTACT_SUPPORT_ACTION,
  };
};

export default getSecretErrorContent;
