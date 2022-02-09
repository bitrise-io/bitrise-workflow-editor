import React, { FC, useState, useMemo, useEffect } from "react";
import { Base, Flex, Text } from "@bitrise/bitkit";
import YmlStorageOption from "./YmlStorageOption";
import StoreOnWebsite from "./StoreOnWebsite";
import StoreInRepository from "./StoreInRepository";
import InlineLink from "../common/InlineLink";

type YmlStorageSettingsProps = {
	appSlug: string;
	usesRepositoryYml: boolean;
	onUsesRepositoryYmlChangeSaved: (usesRepositoryYml: boolean) => void;
};

const YmlStorageSettings: FC<YmlStorageSettingsProps> = ({
	appSlug,
	usesRepositoryYml: _initialUsesRepositoryYml,
	onUsesRepositoryYmlChangeSaved
}: YmlStorageSettingsProps) => {
	const [initialUsesRepositoryYml, setInitialUsesRepositoryYml] = useState(_initialUsesRepositoryYml);
	const [usesRepositoryYml, setUsesRepositoryYml] = useState(_initialUsesRepositoryYml);

	const selectionDiffers = useMemo(() => usesRepositoryYml !== initialUsesRepositoryYml, [usesRepositoryYml]);

	const resetStorageSettings = (): void => {
		setUsesRepositoryYml(initialUsesRepositoryYml);
	};

	useEffect(() => {
		onUsesRepositoryYmlChangeSaved(initialUsesRepositoryYml);
	}, [initialUsesRepositoryYml]);

	return (
		<Base borderRadius="x2" borderColor="gray-4" overflow="hidden">
			<Flex backgroundColor="gray-2" paddingHorizontal="x4" paddingVertical="x3" gap="x2" direction="vertical">
				<Text weight="bold" size="3" textColor="grape-5">
					Where do you want to store the bitrise.yml file?
				</Text>
				<Text size="2" textColor="gray-7">
					Store and manage the bitrise.yml configuration file on either bitrise.io or in your app's repository. Check
					out the <InlineLink text="documentation" url="https://devcenter.bitrise.io/builds/bitrise-yml-online/" /> for
					the details
				</Text>
			</Flex>
			<Flex paddingHorizontal="x4" paddingVertical="x6">
				<Flex width="665px" gap="x6" direction="vertical">
					<Flex direction="horizontal" gap="x6">
						<YmlStorageOption
							onClick={() => setUsesRepositoryYml(false)}
							icon="Globe"
							isActive={!usesRepositoryYml}
							title="Store on bitrise.io"
							description="The bitrise.yml file is stored and managed on bitrise.io."
						/>
						<YmlStorageOption
							onClick={() => setUsesRepositoryYml(true)}
							icon="BranchBranch"
							isActive={usesRepositoryYml}
							title="Store in app repository"
							// eslint-disable-next-line max-len
							description="The bitrise.yml file is stored in your app's repository and it's versioned and maintained using Git."
						/>
					</Flex>

					{selectionDiffers && !usesRepositoryYml && (
						<StoreOnWebsite
							appSlug={appSlug}
							onCancel={resetStorageSettings}
							onSuccess={() => setInitialUsesRepositoryYml(false)}
						/>
					)}

					{selectionDiffers && usesRepositoryYml && (
						<StoreInRepository
							appSlug={appSlug}
							onCancel={resetStorageSettings}
							onSuccess={() => setInitialUsesRepositoryYml(true)}
						/>
					)}
				</Flex>
			</Flex>
		</Base>
	);
};

export default YmlStorageSettings;
