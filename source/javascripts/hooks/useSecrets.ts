import {
  DefaultError,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import SecretApi from '@/core/api/SecretApi';
import { Secret } from '@/core/models/Secret';

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
  const queryClient = useQueryClient();

  return useMutation<unknown, DefaultError, string>({
    mutationFn: (secretKey) => SecretApi.deleteSecret({ appSlug, secretKey }),
    ...options,
    onSuccess: (data, variable, context) => {
      queryClient.refetchQueries({ queryKey: [getSecretsQueryKey(appSlug)] });
      options?.onSuccess?.(data, variable, context);
    },
  });
}

function useUpsertSecret({
  appSlug,
  options,
}: {
  appSlug: string;
  options?: Omit<UseMutationOptions<Secret | undefined, DefaultError, Secret>, 'mutationFn'>;
}) {
  const queryClient = useQueryClient();
  return useMutation<Secret | undefined, DefaultError, Secret>({
    mutationFn: (secret) => SecretApi.upsertSecret({ appSlug, secret }),
    ...options,
    onSuccess: (data, variable, context) => {
      queryClient.refetchQueries({ queryKey: [getSecretsQueryKey(appSlug)] });
      options?.onSuccess?.(data, variable, context);
    },
  });
}

export { useDeleteSecret, useSecrets, useSecretValue, useUpsertSecret };
