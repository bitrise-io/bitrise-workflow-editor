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

// Protection is part of the key so a secret that was just switched to protected can't fall back to its cached plaintext.
function getSecretValueQueryKey(appSlug: string, secretKey: string, isProtected: boolean) {
  return ['app', appSlug, 'secret', secretKey, isProtected];
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
  isProtected = false,
  options,
}: {
  appSlug: string;
  secretKey: string;
  isProtected?: boolean;
  options?: Omit<UseQueryOptions<string | undefined>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery<string | undefined>({
    queryKey: getSecretValueQueryKey(appSlug, secretKey, isProtected),
    queryFn: ({ signal }) => SecretApi.getSecretValue({ appSlug, secretKey, signal }),
    staleTime: 0,
    gcTime: 0,
    // Each protected fetch is an audited peek, so only an explicit eye click may send one.
    ...(isProtected && { retry: false, refetchOnReconnect: false }),
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
    onSuccess: (data, variable, onMutateResult, context) => {
      queryClient.refetchQueries({ queryKey: [getSecretsQueryKey(appSlug)] });
      options?.onSuccess?.(data, variable, onMutateResult, context);
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
    onSuccess: (data, variable, onMutateResult, context) => {
      queryClient.refetchQueries({ queryKey: [getSecretsQueryKey(appSlug)] });
      options?.onSuccess?.(data, variable, onMutateResult, context);
    },
  });
}

export { useDeleteSecret, useSecrets, useSecretValue, useUpsertSecret };
