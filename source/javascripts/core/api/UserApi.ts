import Client from './client';

// DTOs
type UserMetadataRequest = Record<string, unknown>;
type UserMetadataValueResponse = {
  value: unknown;
};

// API CALLS
const USER_METADATA_PATH = '/me/profile/metadata.json';

function getUserMetadataByKeyPath(key: string): string {
  return `/me/profile/metadata.json?key=${key}`;
}

async function getUserMetadataValue({ key, signal }: { key: string; signal?: AbortSignal }): Promise<string> {
  const response = await Client.get<UserMetadataValueResponse>(getUserMetadataByKeyPath(key), {
    signal,
  });
  return response.value as string;
}

function updateUserMetadata({
  metadata,
  signal,
}: {
  metadata: UserMetadataRequest;
  signal?: AbortSignal;
}): Promise<unknown> {
  return Client.put(USER_METADATA_PATH, {
    signal,
    body: JSON.stringify(metadata),
  });
}

export default {
  getUserMetadataByKeyPath,
  getUserMetadataValue,
  getUpdateUserMetadataPath: () => USER_METADATA_PATH,
  updateUserMetadata,
};
