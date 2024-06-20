export type SearchFormValues = {
  search: string;
  categories: string[];
};

export type Step = {
  id: string;
  icon: string;
  title: string;
  summary: string;
  description: string;
  version: string;
  categories: string[];
  isOfficial: boolean;
  isVerified: boolean;
  isDeprecated: boolean;
};
