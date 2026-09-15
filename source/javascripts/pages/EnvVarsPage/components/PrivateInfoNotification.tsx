import { Link } from '@bitrise/bitkit';
import { BitkitAlert } from '@bitrise/bitkit-v2';
import { MouseEventHandler } from 'react';

import useNavigation from '@/hooks/useNavigation';

const SecretsLink = () => {
  const { replace } = useNavigation();

  const onClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    replace('/secrets');
  };

  return (
    <Link href="/secrets" onClick={onClick} isUnderlined>
      Secrets
    </Link>
  );
};

const PrivateInfoNotification = () => {
  return (
    <BitkitAlert
      variant="warning"
      data-clarity-unmask="true"
      titleText="You should not add private information here."
      messageText={
        <>
          These environment variables will also be available in builds triggered by pull requests and bitrise.yml. For
          private info, use <SecretsLink />.
        </>
      }
    />
  );
};

export default PrivateInfoNotification;
