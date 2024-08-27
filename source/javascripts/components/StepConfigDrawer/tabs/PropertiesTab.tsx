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
import StepService from '@/core/models/StepService';
import { useStepDrawerContext } from '../StepConfigDrawer.context';

const PropertiesTab = () => {
  const { isOpen: showMore, onToggle: toggleShowMore } = useDisclosure();
  const { data, isLoading } = useStepDrawerContext();
  const { cvs, mergedValues, resolvedInfo } = data ?? {};

  // Todo loading state
  if (isLoading) {
    return <>Loading...</>;
  }

  const selectableVersions = StepService.getSelectableVersions(data);

  return (
    <Box display="flex" flexDirection="column" gap="24">
      {mergedValues?.source_code_url && (
        <Link
          gap="4"
          display="flex"
          target="_blank"
          alignSelf="start"
          className="source"
          alignItems="center"
          colorScheme="purple"
          rel="noreferrer noopener"
          href={mergedValues?.source_code_url}
          isExternal
        >
          <Text>View source code</Text>
          <Icon name="OpenInBrowser" />
        </Link>
      )}
      <Input defaultValue={resolvedInfo?.title} type="text" label="Name" placeholder="Step name" isRequired />
      <Divider />
      <Select
        backgroundSize="none"
        label="Version updates"
        isDisabled={!StepService.isStepLibStep(cvs || '')}
        defaultValue={resolvedInfo?.normalizedVersion || ''}
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
        {mergedValues?.summary && <MarkdownContent md={mergedValues.summary} />}
        {mergedValues?.description && (
          <>
            <Collapse in={showMore} transition={{ enter: { duration: 0.2 }, exit: { duration: 0.2 } }}>
              <MarkdownContent md={mergedValues.description} />
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
