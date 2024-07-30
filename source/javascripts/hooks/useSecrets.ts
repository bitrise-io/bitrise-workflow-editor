import { DefaultError, useMutation, UseMutationOptions, useQuery } from '@tanstack/react-query';
import SecretApi from '@/api/SecretApi';
import { Secret, SecretWithState } from '@/core/Secret';

function getSecretsQueryKey(appSlug: string, useApi: boolean) {
  return ['app', appSlug, 'secrets', { useApi }];
}

function getSecretValueQueryKey(appSlug: string, secretKey: string, useApi: boolean) {
  return ['app', appSlug, 'secret', secretKey, { useApi }];
}

function useSecrets({ appSlug, useApi = false }: { appSlug: string; useApi?: boolean }) {
  return useQuery<Secret[]>({
    queryKey: getSecretsQueryKey(appSlug, useApi),
    queryFn: ({ signal }) => SecretApi.getSecrets({ appSlug, useApi, signal }),
    staleTime: 0,
    gcTime: 0,
  });
}

function useSecretValue({
  appSlug,
  secretKey,
  useApi = false,
}: {
  appSlug: string;
  secretKey: string;
  useApi?: boolean;
}) {
  return useQuery<string | undefined>({
    queryKey: getSecretValueQueryKey(appSlug, secretKey, useApi),
    queryFn: ({ signal }) => SecretApi.getSecretValue({ appSlug, secretKey, useApi, signal }),
    staleTime: 0,
    gcTime: 0,
  });
}

function useDeleteSecret({
  appSlug,
  options,
}: {
  appSlug: string;
  options?: Omit<UseMutationOptions<never, DefaultError, string>, 'mutationFn'>;
}) {
  return useMutation<never, DefaultError, string>({
    mutationFn: (secretKey) => SecretApi.deleteSecret({ appSlug, secretKey }),
    ...options,
  });
}

function useUpdateSecret({
  appSlug,
  options,
}: {
  appSlug: string;
  options?: Omit<UseMutationOptions<Secret, DefaultError, SecretWithState>, 'mutationFn'>;
}) {
  return useMutation<Secret, DefaultError, SecretWithState>({
    mutationFn: (secret) => SecretApi.updateSecret({ appSlug, secret }),
    ...options,
  });
}

export { useSecrets, useSecretValue, useDeleteSecret, useUpdateSecret };
