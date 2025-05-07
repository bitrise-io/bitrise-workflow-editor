type StepMakerState = InitialState | Planning | CodeGeneration | WaitingForBuild | BuildLogEvaluation;

type InitialState = {
  examplePrompts: string[];
};

// TODO: is "token setup" a different state?

type Planning = {
  messages: string[]; // TODO: define richer message types
  latestPlan: string;
  userQA: Map<string, string>;
  isLoading: boolean;
};

type CodeGeneration = {
  plan: string;
  userQA: Map<string, string>;
  isLoading: boolean;
  messages: string[]; // TODO: define richer message types
};

type WaitingForBuild = {
  buildSlug: string;
  messages: string[]; // TODO: define richer message types
};

type BuildLogEvaluation = {
  plan: string;
  messages: string[]; // TODO: define richer message types
  isLoading: boolean;
  buildLogSnippet: string;
};
