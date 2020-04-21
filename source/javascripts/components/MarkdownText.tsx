import React, { FC } from "react";
import { Base } from "@bitrise/bitkit";
import { Converter } from "showdown";

type MarkdownTextProps = {
	markdown: string;
	[x: string]: any;
};

const stripHtml = (text: string): string => String(text).replace(/<[^>]+>/gm, "");

const MarkdownText: FC<MarkdownTextProps> = ({ markdown, ...rest }: MarkdownTextProps) => {
	const converter = new Converter();
	const markdownHtml = converter.makeHtml(stripHtml(markdown));

	return <Base dangerouslySetInnerHTML={{ __html: markdownHtml }} {...rest}></Base>;
};

export default MarkdownText;
