import { Notification } from '@bitrise/bitkit';

const CreatingYmlOnWebsiteProgress = (): JSX.Element => (
  <Notification status="progress">{window.strings.yml.store_on_website.loading}</Notification>
);

export default CreatingYmlOnWebsiteProgress;
