import { DefaultError, useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Secret } from '@/core/models/Secret';
import SecretApi from '@/core/api/SecretApi';

function getSecretsQueryKey(appSlug: string, useApi: boolean) {
  return ['app', appSlug, 'secrets', { useApi }];
}

function getSecretValueQueryKey(appSlug: string, secretKey: string, useApi: boolean) {
  return ['app', appSlug, 'secret', secretKey, { useApi }];
}

function useSecrets({
  appSlug,
  useApi = false,
  options,
}: {
  appSlug: string;
  useApi?: boolean;
  options?: Omit<UseQueryOptions<Secret[]>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery<Secret[]>({
    queryKey: getSecretsQueryKey(appSlug, useApi),
    queryFn: ({ signal }) => SecretApi.getSecrets({ appSlug, useApi, signal }),
    staleTime: 0,
    gcTime: 0,
    ...options,
  });
}

function useSecretValue({
  appSlug,
  secretKey,
  options,
  useApi = false,
}: {
  appSlug: string;
  secretKey: string;
  useApi?: boolean;
  options?: Omit<UseQueryOptions<string | undefined>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery<string | undefined>({
    queryKey: getSecretValueQueryKey(appSlug, secretKey, useApi),
    queryFn: ({ signal }) => SecretApi.getSecretValue({ appSlug, secretKey, useApi, signal }),
    staleTime: 0,
    gcTime: 0,
    ...options,
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
  options?: Omit<UseMutationOptions<Secret, DefaultError, Secret>, 'mutationFn'>;
}) {
  return useMutation<Secret, DefaultError, Secret>({
    mutationFn: (secret) => SecretApi.updateSecret({ appSlug, secret }),
    ...options,
  });
}

export { useSecrets, useSecretValue, useDeleteSecret, useUpdateSecret };
