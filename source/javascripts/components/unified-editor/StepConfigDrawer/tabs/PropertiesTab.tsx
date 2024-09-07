import {
  Box,
  Collapse,
  Divider,
  Icon,
  Input,
  Link,
  MarkdownContent,
  Select,
  Text,
  useDisclosure,
} from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import StepService from '@/core/models/StepService';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import { FormValues } from '../StepConfigDrawer.types';

const PropertiesTab = () => {
  const { isOpen: showMore, onToggle: toggleShowMore } = useDisclosure();
  const { register } = useFormContext<FormValues>();
  const { data } = useStepDrawerContext();
  const { cvs, mergedValues } = data ?? {};
  const { source_code_url: sourceUrl, summary, description } = mergedValues ?? {};

  const selectableVersions = StepService.getSelectableVersions(data);

  return (
    <Box display="flex" flexDirection="column" gap="24">
      {sourceUrl && (
        <Link
          gap="4"
          display="flex"
          target="_blank"
          alignSelf="start"
          className="source"
          alignItems="center"
          colorScheme="purple"
          rel="noreferrer noopener"
          href={sourceUrl}
          isExternal
        >
          <Text>View source code</Text>
          <Icon name="OpenInBrowser" />
        </Link>
      )}
      <Input
        type="text"
        label="Name"
        placeholder="Step name"
        inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
        {...register('properties.name')}
      />
      <Divider />
      <Select
        backgroundSize="none"
        label="Version updates"
        isDisabled={!StepService.isStepLibStep(cvs || '')}
        {...register('properties.version')}
        isRequired
      >
        {selectableVersions?.map(({ value, label }) => {
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </Select>
      <Divider />
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
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link
              as="button"
              colorScheme="purple"
              alignSelf="self-start"
              onClick={toggleShowMore}
              data-e2e-tag="step-description__toggle"
            >
              {showMore ? 'Show less' : 'Show more'}
            </Link>
          </>
        )}
      </Box>
    </Box>
  );
};

export default PropertiesTab;
