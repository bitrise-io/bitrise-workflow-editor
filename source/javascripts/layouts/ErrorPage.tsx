import { BitkitLink } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Image } from '@chakra-ui/react/image';
import { Text } from '@chakra-ui/react/text';
import { ReactNode } from 'react';

import bitriseLogo from '../../images/bitrise-logo.svg';
import errorImg from '../../images/error-hairball.svg';

type ErrorPageProps = {
  eyebrow: string;
  headline: string;
  children: ReactNode;
};

const ErrorPage = ({ eyebrow, headline, children }: ErrorPageProps) => (
  <Box
    role="alert"
    gap="48"
    width="100vw"
    minHeight="100vh"
    display="flex"
    alignItems="center"
    marginInline="auto"
    paddingInline="5%"
    backgroundImage="linear-gradient(315deg, var(--colors-purple-30), var(--colors-purple-10))"
  >
    <Box display="flex" flexDirection="column" gap="32" color="text/on-color" maxWidth="50%">
      <BitkitLink href="/" title="Go to Dashboard">
        <Image src={bitriseLogo} />
      </BitkitLink>
      <Box>
        <Text textStyle="code/lg" textTransform="uppercase" marginBlockEnd="16">
          {eyebrow}
        </Text>
        {/* `display/lg` (48px bold): BitkitHeading takes its size from its level and tops out at 30px. */}
        <Text textStyle="display/lg">{headline}</Text>
      </Box>
      {children}
    </Box>
    <Box>
      <Image src={errorImg} />
    </Box>
  </Box>
);

export default ErrorPage;
