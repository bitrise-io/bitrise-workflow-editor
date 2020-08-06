import React, { FC } from "react";
import { Flex, Text, Icon, TypeIconName } from "@bitrise/bitkit";

type StepItemProps = {
	icon: TypeIconName;
	isActive: boolean;
	title: string;
	description: string;
	onClick(): void;
};

const YmlStorageOption: FC<StepItemProps> = ({ isActive, title, description, icon, onClick }: StepItemProps) => (
	<Flex
		elevation="x2"
		backgroundColor={isActive ? "grape-1" : "white"}
		borderColor={isActive ? "grape-3" : "gray-2"}
		borderWidth={isActive ? "x2" : "x1"}
		borderRadius="x2"
		direction="horizontal"
		padding="x4"
		gap="x3"
		initial="container"
		grow
		shrink
		onClick={onClick}
		clickable
	>
		<Icon textColor="grape-4" name={icon}></Icon>
		<Flex grow shrink>
			<Text weight="bold" config="7" textColor="grape-5">
				{title}
			</Text>
			<Text config="8" textColor="gray-7">
				{description}
			</Text>
		</Flex>
	</Flex>
);

export default YmlStorageOption;
