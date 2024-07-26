import { Notification } from '@bitrise/bitkit';

const ValidatingYmlInRepoProgress = (): JSX.Element => (
  <Notification status="progress">{window.strings.yml.store_in_repository.validation_loading}</Notification>
);

export default ValidatingYmlInRepoProgress;
