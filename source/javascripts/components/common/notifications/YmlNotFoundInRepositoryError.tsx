import { Notification } from '@bitrise/bitkit';

const YmlNotFoundInRepositoryError = (): JSX.Element => (
  <Notification status="error" marginBlockStart="24">
    {window.strings.yml.store_in_repository.not_found}
  </Notification>
);

export default YmlNotFoundInRepositoryError;
