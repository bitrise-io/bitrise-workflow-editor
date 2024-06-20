export type FilterFormValues = {
  search: string;
  projectType: string;
  categories: string[];
};

export type Step = {
  id: string;
  icon: string;
  title: string;
  description: string;
  version: string;
  categories: string[];
  isOfficial: boolean;
  isVerified: boolean;
  isDeprecated: boolean;
};
