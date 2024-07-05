export const configPath = (appSlug: string): string => {
  return `/api/app/${appSlug}/config`;
};

export const pipelineConfigPath = (appSlug: string): string => {
  return `/app/${appSlug}/pipeline_config`;
};

export const notificationMetaDataPath = (): string => {
  return `/me/profile/metadata.json`;
};
