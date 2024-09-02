import { useEffect, useState } from 'react';
import { Box, Collapse, Divider, Icon, Input, Link, MarkdownContent, Select, Text } from '@bitrise/bitkit';
import { useForm } from 'react-hook-form';

import { OnStepChange, Step, StepVersionWithRemark } from '@/models';
import { extractStepFields } from './StepConfigPanel.utils';

type Props = {
  step: Step;
  versionsWithRemarks: Array<StepVersionWithRemark>;
  onChange: OnStepChange;
};

const StepProperties = ({ step, versionsWithRemarks, onChange }: Props) => {
  const { name, version, sourceURL, summary, description, isLibraryStep } = extractStepFields(step);
  const [showMore, setShowMore] = useState(false);

  const { register, setValue, handleSubmit } = useForm<{
    properties: { name: string; version: string };
  }>();
  useEffect(() => {
    setValue('properties.name', name);
    setValue('properties.version', version);
  }, [name, version, setValue]);

  const handleChange = handleSubmit(onChange);
  return (
    <Box as="form" display="flex" flexDirection="column" p="24" gap="24" onChange={handleChange}>
      {sourceURL && (
        <Link
          display="flex"
          alignItems="center"
          alignSelf="start"
          gap="4"
          href={sourceURL}
          target="_blank"
          rel="noreferrer noopener"
          colorScheme="purple"
          className="source"
          isExternal
        >
          <Text>View source code</Text>
          <Icon name="OpenInBrowser" />
        </Link>
      )}
      <Input {...register('properties.name')} type="text" label="Name" placeholder="Step name" isRequired />
      <Divider />
      {isLibraryStep && (
        <>
          <Select
            {...register('properties.version')}
            label="Version updates"
            isRequired
            isDisabled={!isLibraryStep}
            backgroundSize="none"
          >
            {versionsWithRemarks.map(({ version: value, remark }) => {
              return (
                <option key={value} value={value || ''}>
                  {value || 'Always latest'} - {remark}
                </option>
              );
            })}
          </Select>
          <Divider />
        </>
      )}
      <Box display="flex" flexDirection="column" gap="8" data-e2e-tag="step-description">
        <Text size="2" fontWeight="600">
          Summary
        </Text>
        {summary && <MarkdownContent md={summary} />}
        {description && (
          <>
            <Collapse in={showMore} transition={{ enter: { duration: 0.2 }, exit: { duration: 0.2 } }}>
              <MarkdownContent md={description} />
            </Collapse>
            <Link
              as="button"
              colorScheme="purple"
              alignSelf="self-start"
              data-e2e-tag="step-description__toggle"
              onClick={() => setShowMore((prev) => !prev)}
            >
              {showMore ? 'Show less' : 'Show more'}
            </Link>
          </>
        )}
      </Box>
    </Box>
  );
};

export default StepProperties;
