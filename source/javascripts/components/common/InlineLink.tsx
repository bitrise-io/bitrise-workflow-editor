import React, { FC } from "react";
import { Link, Text, TypeColors, TextProps } from "@bitrise/bitkit";

type InlineLinkProps = {
	text: string;
	url: string;
	color?: TypeColors;
} & TextProps;

const InlineLink: FC<InlineLinkProps> = (props: InlineLinkProps) => {
	const { text, url, color = "grape-3", ...rest } = props;

	return (
		<Text {...rest} inline textColor={color}>
			<Link target="_blank" href={url}>
				{text}
			</Link>
		</Text>
	);
};

export default InlineLink;
