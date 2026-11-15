import {
  BitkitAlert,
  BitkitButton,
  BitkitCodeSnippet,
  BitkitFormDialog,
  BitkitIconButton,
  BitkitTextInput,
  IconCopy,
} from '@bitrise/bitkit-v2';
import { Text } from '@chakra-ui/react/text';
import { FormEvent, useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import { useSecretFingerprint } from '@/hooks/useSecrets';

// Mirrors the backend check: only `openssl rand -hex 32` output, so the key itself can't be guessed.
const FINGERPRINT_KEY_PATTERN = /^[0-9a-fA-F]{64}$/;

type Props = {
  appSlug: string;
  secretKey: string;
  onClose: () => void;
};

const SecretFingerprintDialog = ({ appSlug, secretKey, onClose }: Props) => {
  const [, copy] = useCopyToClipboard();
  const [fingerprintKey, setFingerprintKey] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);
  const { mutate, data: fingerprint, isPending, isError, isSuccess } = useSecretFingerprint({ appSlug, secretKey });

  const isKeyValid = FINGERPRINT_KEY_PATTERN.test(fingerprintKey);
  // The same pipeline as the backend: HMAC-SHA256 keyed with the hex string as typed, first 6 hex chars.
  const localCommand = `read -rs C; printf '%s' "$C" | openssl dgst -sha256 -hmac "${fingerprintKey}" | awk '{print $NF}' | cut -c1-6`;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isKeyValid) {
      setShowValidationError(true);
      return;
    }
    mutate(fingerprintKey);
  };

  return (
    <BitkitFormDialog
      open
      title={`Fingerprint of ${secretKey}`}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
      onSubmit={onSubmit}
      noValidate
      state={isPending ? 'loading' : undefined}
      footerButtons={
        isSuccess ? (
          <BitkitButton onClick={onClose}>Close</BitkitButton>
        ) : (
          <>
            <BitkitButton variant="secondary" onClick={onClose}>
              Cancel
            </BitkitButton>
            <BitkitButton type="submit" state={isPending ? 'loading' : undefined}>
              Generate fingerprint
            </BitkitButton>
          </>
        )
      }
    >
      <Text>
        Protected Secret values can&apos;t be revealed. To find out which of your keys this Secret holds, generate a
        fingerprint of it, then compute the same fingerprint for your keys and compare.
      </Text>
      <Text>Generate a random fingerprint key on your machine:</Text>
      <BitkitCodeSnippet variant="single" copyLabel="Copy key generation command">
        openssl rand -hex 32
      </BitkitCodeSnippet>
      <BitkitTextInput
        label="Fingerprint key"
        helperText="64 hexadecimal characters."
        errorText={
          showValidationError && !isKeyValid ? 'Enter the 64-character output of the command above.' : undefined
        }
        value={fingerprintKey}
        onValueChange={(value) => {
          setFingerprintKey(value.trim());
          setShowValidationError(false);
        }}
        state={isSuccess ? 'readOnly' : undefined}
        endAddon={
          isSuccess ? (
            <BitkitIconButton
              variant="secondary"
              icon={IconCopy}
              label="Copy fingerprint key"
              onClick={() => copy(fingerprintKey)}
            />
          ) : undefined
        }
      />
      {isError && <BitkitAlert variant="critical" messageText="Could not generate the fingerprint. Try again." />}
      {isSuccess && fingerprint && (
        <>
          <BitkitTextInput
            label="Fingerprint"
            value={fingerprint}
            state="readOnly"
            endAddon={
              <BitkitIconButton
                variant="secondary"
                icon={IconCopy}
                label="Copy fingerprint"
                onClick={() => copy(fingerprint)}
              />
            }
          />
          <Text>Run this for each of your keys, paste the key when asked, and look for the same fingerprint:</Text>
          <BitkitCodeSnippet variant="multi" copyLabel="Copy fingerprint command">
            {localCommand}
          </BitkitCodeSnippet>
          <BitkitAlert
            variant="info"
            messageText="A trailing newline or space changes the fingerprint. A match proves which key it is, but no match proves nothing: rotate any key you can't match."
          />
        </>
      )}
    </BitkitFormDialog>
  );
};

export default SecretFingerprintDialog;
