import { Link } from '@bitrise/bitkit';
import { BitkitEmptyState, IconTrigger } from '@bitrise/bitkit-v2';

import { TriggerType } from '@/core/models/Trigger';

const TEXTS = {
  push: {
    title: 'Your push triggers will appear here',
    description: 'A push based trigger automatically starts builds when commits are pushed to your repository.',
  },
  pull_request: {
    title: 'Your pull request triggers will appear here',
    description:
      'A pull request based trigger automatically starts builds when specific PR related actions detected within your repository.',
  },
  tag: {
    title: 'Your tag triggers will appear here',
    description: 'A tag-based trigger automatically starts builds when tags gets pushed to your repository.',
  },
} as const satisfies Record<TriggerType, { title: string; description: string }>;

type Props = {
  type: TriggerType;
};

const LegacyEmptyState = ({ type }: Props) => {
  const { title, description } = TEXTS[type];

  return (
    // `headingText`/`bodyText` come from the static TEXTS map above, keyed by trigger type.
    <BitkitEmptyState
      data-clarity-unmask="true"
      icon={IconTrigger}
      headingText={title}
      maxHeight="208"
      bodyText={
        <>
          {description}{' '}
          <Link
            colorScheme="purple"
            href="https://docs.bitrise.io/en/bitrise-ci/run-and-analyze-builds/starting-builds/triggering-builds-automatically.html"
          >
            Learn more
          </Link>
        </>
      }
    />
  );
};

export default LegacyEmptyState;
