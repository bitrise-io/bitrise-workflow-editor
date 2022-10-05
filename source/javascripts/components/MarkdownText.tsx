import { Box } from "@bitrise/bitkit";
import { Converter } from "showdown";

type MarkdownTextProps = {
	markdown: string;
	[x: string]: any;
};

const stripHtml = (text: string): string => String(text).replace(/<[^>]+>/gm, "");

const MarkdownText = ({ markdown, ...rest }: MarkdownTextProps): JSX.Element => {
	const converter = new Converter();
	const markdownHtml = converter.makeHtml(stripHtml(markdown));

	return <Box dangerouslySetInnerHTML={{ __html: markdownHtml }} {...rest}></Box>;
};

export default MarkdownText;
