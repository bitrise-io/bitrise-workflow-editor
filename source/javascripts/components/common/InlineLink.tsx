import { FC } from "react";
import { Link, Text, TypeColors, TextProps } from "@bitrise/bitkit";

type InlineLinkProps = {
	text: string;
	url: string;
	color?: TypeColors;
	underline?: boolean;
} & TextProps;

const InlineLink: FC<InlineLinkProps> = (props: InlineLinkProps) => {
	const { text, url, color = "grape-3", underline, ...rest } = props;

	return (
		<Text {...rest} as="span" textColor={color}>
			<Link isUnderlined={underline} target="_blank" href={url}>
				{text}
			</Link>
		</Text>
	);
};

export default InlineLink;
