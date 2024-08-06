import { Notification } from '@bitrise/bitkit';

const LookingForYmlInRepoProgress = (): JSX.Element => (
  <Notification status="progress">{window.strings.yml.store_in_repository.loading}</Notification>
);

export default LookingForYmlInRepoProgress;
