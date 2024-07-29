import Client from '@/api/client';

// DTOs
type UserMetadataDto = Record<string, unknown>;
type UserMetadataValueDto = {
  value: unknown;
};

// API CALLS
const USER_METADATA_PATH = '/me/profile/metadata.json';

export function getUserMetadataByKeyPath(key: string): string {
  return `/me/profile/metadata.json?key=${key}`;
}

export async function getUserMetadataValue({ key, signal }: { key: string; signal?: AbortSignal }): Promise<string> {
  const response = await Client.get<UserMetadataValueDto>(getUserMetadataByKeyPath(key), {
    signal,
  });
  return response.value as string;
}

export function updateUserMetadata({
  metadata,
  signal,
}: {
  metadata: UserMetadataDto;
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
