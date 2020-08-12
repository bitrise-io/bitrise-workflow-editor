import React, { FC } from "react";
import { Text, Notification } from "@bitrise/bitkit";
import InlineLink from "../common/InlineLink";

export const CreatingYmlOnWebsiteProgress: FC = () => (
	<Notification type="progress">Creating bitrise.yml on bitrise.io...</Notification>
);

export const LookingForYmlInRepoProgress: FC = () => (
	<Notification type="progress">Looking for bitrise.yml in the app repository...</Notification>
);

export const ValidatingYmlInRepoProgress: FC = () => (
	<Notification type="progress">Validating bitrise.yml in the app repository...</Notification>
);

export const YmlNotFoundInRepositoryError: FC = () => (
	<Notification type="alert">
		Couldn't find a bitrise.yml file in the app's repository. Add the file to your main branch and try again.
	</Notification>
);

export const YmlInRepositoryInvalidError: FC = () => (
	<Notification type="alert">
		<Text>
			The bitrise.yml file in the repository seems invalid. Please review and fix it before proceeding. Read more about
			the{" "}
			<InlineLink
				underline
				color="red-4"
				text="valid syntax of the bitrise.yml file."
				url="https://devcenter.bitrise.io/builds/bitrise-yml-online/"
			/>
		</Text>
	</Notification>
);
