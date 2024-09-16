import { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogBody, DialogFooter, Link, ProgressBitbot, Tag, Text } from '@bitrise/bitkit';
import { useQuery } from '@tanstack/react-query';
import StepApi from '@/core/api/StepApi';
import StepService from '@/core/models/StepService';

type Props = {
  cvs: string;
  oldVersion: string;
  newVersion: string;
};

const VersionChangedDialog = ({ cvs, oldVersion, newVersion }: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const { id } = StepService.parseStepCVS(cvs);

  useEffect(() => {
    setIsOpen(true);
  }, [id, oldVersion, newVersion]);

  const oldCvs = StepService.createStepCVS(cvs, oldVersion);
  const { data: oldStep, isFetching: isOldStepLoading } = useQuery({
    queryKey: ['steps', { oldCvs }],
    queryFn: () => StepApi.getStepByCvs(oldCvs),
    enabled: Boolean(oldCvs),
  });

  const newCvs = StepService.createStepCVS(cvs, newVersion);
  const { data: newStep, isFetching: isNewStepLoading } = useQuery({
    queryKey: ['steps', { newCvs }],
    queryFn: () => StepApi.getStepByCvs(newCvs),
    enabled: Boolean(newCvs),
  });

  const isFetching = isOldStepLoading || isNewStepLoading;
  const { removedInputs, newInputs, change } = StepService.calculateChange(oldStep, newStep);
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
              {' Please check the '}
              <Link href={sourceUrl} isExternal colorScheme="purple">
                release notes
              </Link>
              .
            </>
          )}
        </Text>
        {(isOldStepLoading || isNewStepLoading) && <ProgressBitbot content="Calculating version differences..." />}
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
