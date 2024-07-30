import { Notification } from '@bitrise/bitkit';

import { WFEWindow } from '../../../typings/global';

const YmlNotFoundInRepositoryError = (): JSX.Element => (
  <Notification status="error" marginBlockStart="24">
    {(window as WFEWindow).strings.yml.store_in_repository.not_found}
  </Notification>
);

export default YmlNotFoundInRepositoryError;
