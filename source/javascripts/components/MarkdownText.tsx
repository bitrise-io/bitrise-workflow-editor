import React, { FC } from "react";
import { Converter } from "showdown";

type MarkdownTextProps = {
	markdown: string;
};

const stripHtml = (text: string): string => String(text).replace(/<[^>]+>/gm, "");

const MarkdownText: FC<MarkdownTextProps> = ({ markdown }: MarkdownTextProps) => {
	const converter = new Converter();
	const markdownHtml = converter.makeHtml(stripHtml(markdown));

	return <div dangerouslySetInnerHTML={{ __html: markdownHtml }}></div>;
};

export default MarkdownText;
