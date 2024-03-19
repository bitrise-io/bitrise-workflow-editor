import { Box, Link, Notification, Text } from "@bitrise/bitkit";

import { WFEWindow } from "../../../typings/global";

type Props = {
  errorMessage?: string;
};

const YmlInRepositoryInvalidError = ({ errorMessage }: Props): JSX.Element => (
  <Notification status="error" justifyContent="start">
    <Box display="flex" flexDirection="column" gap="x4">
      <Text>
        {(window as WFEWindow).strings.yml.store_in_repository.validation_error}{" "}
        <Link
          isUnderlined
          color="red.40"
          href="https://devcenter.bitrise.io/builds/bitrise-yml-online/"
        >
          valid syntax of the bitrise.yml file.
        </Link>
      </Text>
      <Text>{errorMessage}</Text>
    </Box>
  </Notification>
);

export default YmlInRepositoryInvalidError;
