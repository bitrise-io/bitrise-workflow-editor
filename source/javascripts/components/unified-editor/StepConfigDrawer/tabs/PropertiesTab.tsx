import { useMemo } from 'react';
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
import VersionUtils from '@/core/utils/VersionUtils';
import VersionChangedDialog from '@/components/unified-editor/VersionChangedDialog/VersionChangedDialog';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import { FormValues } from '../StepConfigDrawer.types';

type StepVersionProps = {
  variant: 'input' | 'select';
  canChangeVersion?: boolean;
  selectableVersions?: ReturnType<typeof StepService.getSelectableVersions>;
};
const StepVersion = ({ variant, canChangeVersion, selectableVersions }: StepVersionProps) => {
  const form = useFormContext<FormValues>();

  if (!canChangeVersion) {
    return <Input label="Version" placeholder="Always latest" isDisabled />;
  }

  if (variant === 'select') {
    return (
      <Select backgroundSize="none" label="Version" {...form.register('properties.version')} isRequired>
        {selectableVersions?.map(({ value, label }) => {
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </Select>
    );
  }

  return (
    <Input
      type="text"
      label="Version"
      placeholder="Always latest"
      inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
      {...form.register('properties.version')}
    />
  );
};

const PropertiesTab = () => {
  const defaultStepLibrary = useDefaultStepLibrary();
  const { isOpen: showMore, onToggle: toggleShowMore } = useDisclosure();
  const form = useFormContext<FormValues>();
  const { data, error, workflowId, stepIndex, isLoading } = useStepDrawerContext();
  const { cvs = '', mergedValues, resolvedInfo } = data ?? {};
  const { source_code_url: sourceUrl, summary, description } = mergedValues ?? {};
  const oldVersion = useMemo(() => {
    if (isLoading) return '';
    return resolvedInfo?.resolvedVersion ?? '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId, stepIndex, isLoading, resolvedInfo?.resolvedVersion]);
  const newVersion = VersionUtils.resolveVersion(form.watch('properties.version'), resolvedInfo?.versions);

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
        {...form.register('properties.name')}
      />
      <Divider />
      <StepVersion
        variant={StepService.isBitriseLibraryStep(cvs, defaultStepLibrary) ? 'select' : 'input'}
        canChangeVersion={StepService.canUpdateVersion(cvs, defaultStepLibrary)}
        selectableVersions={StepService.getSelectableVersions(data)}
      />
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
      {!error && <VersionChangedDialog cvs={cvs} oldVersion={oldVersion} newVersion={newVersion} />}
    </Box>
  );
};

export default PropertiesTab;
