import { BitkitAlert } from '@bitrise/bitkit-v2';

import getSecretErrorContent, { SecretOperation } from './getSecretErrorContent';

type Props = {
  error: Error | null;
  operation: SecretOperation;
};

const SecretErrorAlert = ({ error, operation }: Props) => {
  if (!error) {
    return null;
  }

  return <BitkitAlert variant="critical" {...getSecretErrorContent(error, operation)} />;
};

export default SecretErrorAlert;
