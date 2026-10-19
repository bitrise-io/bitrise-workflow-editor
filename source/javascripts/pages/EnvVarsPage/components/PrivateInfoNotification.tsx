import { BitkitAlert, BitkitLink } from '@bitrise/bitkit-v2';
import { MouseEventHandler } from 'react';

import useNavigation from '@/hooks/useNavigation';

const SecretsLink = () => {
  const { replace } = useNavigation();

  const onClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    replace('/secrets');
  };

  return (
    <BitkitLink href="/secrets" onClick={onClick} isUnderlined>
      Secrets
    </BitkitLink>
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
