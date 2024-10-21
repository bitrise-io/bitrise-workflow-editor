import { DefaultError, useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Secret } from '@/core/models/Secret';
import SecretApi from '@/core/api/SecretApi';

function getSecretsQueryKey(appSlug: string) {
  return ['app', appSlug, 'secrets'];
}

function getSecretValueQueryKey(appSlug: string, secretKey: string) {
  return ['app', appSlug, 'secret', secretKey];
}

function useSecrets({
  appSlug,
  options,
}: {
  appSlug: string;
  options?: Omit<UseQueryOptions<Secret[]>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery<Secret[]>({
    queryKey: getSecretsQueryKey(appSlug),
    queryFn: ({ signal }) => SecretApi.getSecrets({ appSlug, signal }),
    staleTime: 0,
    gcTime: 0,
    ...options,
  });
}

function useSecretValue({
  appSlug,
  secretKey,
  options,
}: {
  appSlug: string;
  secretKey: string;
  options?: Omit<UseQueryOptions<string | undefined>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery<string | undefined>({
    queryKey: getSecretValueQueryKey(appSlug, secretKey),
    queryFn: ({ signal }) => SecretApi.getSecretValue({ appSlug, secretKey, signal }),
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
  options?: Omit<UseMutationOptions<unknown, DefaultError, string>, 'mutationFn'>;
}) {
  return useMutation<unknown, DefaultError, string>({
    mutationFn: (secretKey) => SecretApi.deleteSecret({ appSlug, secretKey }),
    ...options,
  });
}

function useUpsertSecret({
  appSlug,
  options,
}: {
  appSlug: string;
  options?: Omit<UseMutationOptions<Secret, DefaultError, Secret>, 'mutationFn'>;
}) {
  return useMutation<Secret, DefaultError, Secret>({
    mutationFn: (secret) => SecretApi.upsertSecret({ appSlug, secret }),
    ...options,
  });
}

export { useSecrets, useSecretValue, useDeleteSecret, useUpsertSecret };
