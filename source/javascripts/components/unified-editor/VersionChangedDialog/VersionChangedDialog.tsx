import { useEffect } from 'react';
import { Box, Button, Dialog, DialogBody, DialogFooter, Link, Tag, Text, useDisclosure } from '@bitrise/bitkit';
import { useQuery } from '@tanstack/react-query';
import StepApi from '@/core/api/StepApi';
import StepService from '@/core/services/StepService';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';

type Props = {
  cvs: string;
  oldVersion: string;
  newVersion: string;
  onClose?: () => void;
};

const VersionChangedDialog = ({ cvs, oldVersion, newVersion, ...props }: Props) => {
  const defaultStepLibrary = useDefaultStepLibrary();
  const { isOpen, onOpen, onClose } = useDisclosure(props);

  const { id } = StepService.parseStepCVS(cvs, defaultStepLibrary);

  const oldCvs = StepService.updateVersion(cvs, defaultStepLibrary, oldVersion);
  const { data: oldStep, isLoading: isOldStepLoading } = useQuery({
    queryKey: ['steps', { cvs: oldCvs, defaultStepLibrary }],
    queryFn: () => StepApi.getStepByCvs(oldCvs, defaultStepLibrary),
    enabled: Boolean(id && oldCvs),
    staleTime: Infinity,
  });

  const newCvs = StepService.updateVersion(cvs, defaultStepLibrary, newVersion);
  const { data: newStep, isLoading: isNewStepLoading } = useQuery({
    queryKey: ['steps', { cvs: newCvs, defaultStepLibrary }],
    queryFn: () => StepApi.getStepByCvs(newCvs, defaultStepLibrary),
    enabled: Boolean(id && newCvs),
    staleTime: Infinity,
  });

  const isLoading = isOldStepLoading || isNewStepLoading;
  const { removedInputs, newInputs, change } = StepService.calculateChange(oldStep, newStep, defaultStepLibrary);
  const sourceUrl = newStep?.defaultValues?.source_code_url;

  useEffect(() => {
    if (!isLoading && change !== 'none') onOpen();
    if (!isLoading && change === 'none') onClose();
  }, [change, isLoading, onClose, onOpen]);

  if (isLoading || change === 'none') {
    return null;
  }

  const [title, context] =
    change === 'major'
      ? ['Major version change', 'The new major version likely contains breaking changes in the step behavior.']
      : ['Version change', change === 'inputs' ? 'The new version contains some input changes.' : ''];

  return (
    <Dialog title={title} isOpen={isOpen} onClose={onClose}>
      <DialogBody display="flex" flexDir="column" gap="16">
        <Text>
          {context}
          {sourceUrl && (
            <>
              {' Please check the '}
              <Link href={sourceUrl} isExternal colorScheme="purple">
                release notes
              </Link>
              .
            </>
          )}
        </Text>
        {newInputs.length > 0 && (
          <>
            <Text textStyle="body/lg/semibold">New inputs</Text>
            <Box display="flex" flexWrap="wrap" gap="12">
              {newInputs.map((input) => (
                <Tag size="sm" colorScheme="green" key={input}>
                  {input}
                </Tag>
              ))}
            </Box>
          </>
        )}
        {removedInputs.length > 0 && (
          <>
            <Text textStyle="body/lg/semibold">Removed inputs</Text>
            <Box display="flex" flexWrap="wrap" gap="12">
              {removedInputs.map((input) => (
                <Tag size="sm" colorScheme="red" key={input}>
                  {input}
                </Tag>
              ))}
            </Box>
          </>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default VersionChangedDialog;
