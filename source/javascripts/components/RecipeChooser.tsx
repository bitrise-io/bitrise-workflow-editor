import {
	Accordion,
	AccordionItem,
	Box,
	Button,
	Divider,
	Link,
	MarkdownContent,
	SearchInput,
	Tag,
	Text
} from "@bitrise/bitkit";
import { useEffect, useMemo, useState } from "react";
import useFetchCallback from "../hooks/api/useFetchCallback";
type RecipeJson = { markdown: string; tags: string[] };
type CategoryChooserProps = {
	total: number;
	categories: Record<string, number>;
	selected: string | null;
	onChange: (n: string | null) => void;
};

const CategoryChooser = ({ categories, selected, onChange, total }: CategoryChooserProps): JSX.Element => {
	return (
		<>
			<Tag onClick={() => onChange(null)}>All categories ({total})</Tag>
			{Object.entries(categories).map(([c, n]) => (
				<Tag key={c} onClick={() => onChange(c)} colorScheme={c === selected ? "purple" : "neutral"}>
					{c} {n}
				</Tag>
			))}
		</>
	);
};

const mdComponents: React.ComponentProps<typeof MarkdownContent>["components"] = {
	a: ({ href, children }) => (
		<Link href={href} colorScheme="purple">
			{children}
		</Link>
	),
	pre: ({ children }) => (
		<Box as="pre" lineHeight="16px" fontSize="14px">
			{children}
		</Box>
	)
};

function useDebounce<T>(value: T, delay?: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
}

const RecipeChooser = ({ onSelected }: { onSelected: (r: RecipeJson) => void }): JSX.Element => {
	const [search, setSearch] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>("");
	const data = useFetchCallback<RecipeJson[], unknown>(
		"https://hackathon-workflow-recipes.storage.googleapis.com/merged.json"
	);
	useEffect(() => {
		data.call();
	}, []);
	const { tags, total }: { tags: Record<string, number>; total: number } = useMemo(() => {
		const cats =
			data.result?.reduce((acc, { tags: item }) => {
				item.forEach(tag => {
					acc[tag] = acc[tag] ?? 0;
					acc[tag]++;
				});
				return acc;
			}, {}) || {};

		return { tags: cats, total: data.result?.length || 0 };
	}, [data.result]);
	const debouncedSearch = useDebounce(search);
	const results = useMemo(() => {
		const needle = new RegExp(debouncedSearch, "i");
		return data.result?.filter(recipe => recipe.tags.some(t => t.match(needle)) || recipe.markdown.match(needle)) || [];
	}, [data.result, debouncedSearch]);
	return (
		<>
			<Text size="2" textTransform="uppercase">
				Step 1 of 2
			</Text>
			<Text size="4" fontWeight="bold">
				Select recipe
			</Text>
			<Divider marginBottom="24" marginTop="18" />
			<Text marginBottom="24">Select the recipe that you would like to add to the bitrise.yml.</Text>
			<SearchInput onChange={setSearch} placeholder="Search for recipes" />
			<CategoryChooser categories={tags} total={total} selected={selectedCategory} onChange={setSelectedCategory} />
			<Accordion maxHeight="40vh" overflowY="auto" allowMultiple={false} allowToggle defaultIndex={[]}>
				{results.map((r, idx) => (
					<AccordionItem motionProps={{ unmountOnExit: true }} key={idx} buttonContent="???">
						<MarkdownContent md={r.markdown} components={mdComponents} />
						<Button onClick={() => onSelected(r)}>Select</Button>
					</AccordionItem>
				))}
			</Accordion>
		</>
	);
};

export default RecipeChooser;
