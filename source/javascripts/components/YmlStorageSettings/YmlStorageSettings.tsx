import React, { FC, useState, useMemo, useEffect } from "react";
import { Base, Flex, Text } from "@bitrise/bitkit";
import YmlStorageOption from "./YmlStorageOption";
import StoreOnWebsite from "./StoreOnWebsite";
import StoreInRepository from "./StoreInRepository";

type YmlStorageSettingsProps = {
	appSlug: string;
	usesRepositoryYml: boolean;
	onUsesRepositoryYmlChanged: (usesRepositoryYml: boolean) => void;
};

const YmlStorageSettings: FC<YmlStorageSettingsProps> = ({
	appSlug,
	usesRepositoryYml: _initialUsesRepositoryYml,
	onUsesRepositoryYmlChanged
}: YmlStorageSettingsProps) => {
	const [initialUsesRepositoryYml, setInitialUsesRepositoryYml] = useState(_initialUsesRepositoryYml);
	const [usesRepositoryYml, setUsesRepositoryYml] = useState(_initialUsesRepositoryYml);

	const selectionDiffers = useMemo(() => usesRepositoryYml !== initialUsesRepositoryYml, [usesRepositoryYml]);

	const resetStorageSettings = (): void => {
		setUsesRepositoryYml(initialUsesRepositoryYml);
	};

	useEffect(() => {
		onUsesRepositoryYmlChanged(usesRepositoryYml);
	}, [usesRepositoryYml]);

	return (
		<Base borderRadius="x2" borderColor="gray-4" overflow="hidden">
			<Flex backgroundColor="gray-2" paddingHorizontal="x4" paddingVertical="x3" gap="x2" direction="vertical">
				<Text weight="bold" config="7" textColor="grape-5">
					bitrise.yml storage
				</Text>
				<Text config="8" textColor="gray-7">
					Store and manage bitrise.yml on bitrise.io or in the app respository.
				</Text>
			</Flex>
			<Flex paddingHorizontal="x4" paddingVertical="x6">
				<Flex width="665px" gap="x6" direction="vertical">
					<Flex direction="horizontal" gap="x4">
						<YmlStorageOption
							onClick={() => setUsesRepositoryYml(false)}
							icon="Globe"
							isActive={!usesRepositoryYml}
							title="Store on bitrise.io"
							description="Bitrise.yml is stored and managed on bitrise.io."
						/>
						<YmlStorageOption
							onClick={() => setUsesRepositoryYml(true)}
							icon="BranchBranch"
							isActive={usesRepositoryYml}
							title="Store in app repository"
							description="Bitrise.yml is stored in the app repository and managed with Git."
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
