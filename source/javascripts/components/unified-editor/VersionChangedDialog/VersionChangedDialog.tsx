import { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogBody, DialogFooter, Link, Tag, Text } from '@bitrise/bitkit';
import { useQuery } from '@tanstack/react-query';
import StepApi from '@/core/api/StepApi';
import StepService from '@/core/models/StepService';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';

type Props = {
  cvs: string;
  oldVersion: string;
  newVersion: string;
};

const VersionChangedDialog = ({ cvs, oldVersion, newVersion }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const defaultStepLibrary = useDefaultStepLibrary();

  const { id } = StepService.parseStepCVS(cvs, defaultStepLibrary);

  useEffect(() => {
    setIsOpen(true);
  }, [id, oldVersion, newVersion]);

  const oldCvs = StepService.updateVersion(cvs, defaultStepLibrary, oldVersion);
  const { data: oldStep, isFetching: isOldStepLoading } = useQuery({
    queryKey: ['steps', { oldCvs }, defaultStepLibrary],
    queryFn: () => StepApi.getStepByCvs(oldCvs, defaultStepLibrary),
    enabled: Boolean(isOpen && id && oldCvs),
  });

  const newCvs = StepService.updateVersion(cvs, defaultStepLibrary, newVersion);
  const { data: newStep, isFetching: isNewStepLoading } = useQuery({
    queryKey: ['steps', { newCvs }, defaultStepLibrary],
    queryFn: () => StepApi.getStepByCvs(newCvs, defaultStepLibrary),
    enabled: Boolean(isOpen && id && newCvs),
  });

  const isFetching = isOldStepLoading || isNewStepLoading;
  const { removedInputs, newInputs, change } = StepService.calculateChange(oldStep, newStep, defaultStepLibrary);
  const sourceUrl = newStep?.defaultValues?.source_code_url;

  if (isFetching || change === 'none') {
    return null;
  }

  const [title, context] =
    change === 'major'
      ? ['Major version change', 'The new major version likely contains breaking changes in the step behavior.']
      : ['Version change', change === 'inputs' ? 'The new version contains some input changes.' : ''];

  return (
    <Dialog title={title} isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <DialogBody display="flex" flexDir="column" gap="16">
        <Text>
          {context}
          {sourceUrl && (
            <>
              {'Please check the '}
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
        <Button variant="secondary" onClick={() => setIsOpen(false)} data-e2e-tag="close-version-change-dialog">
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default VersionChangedDialog;
