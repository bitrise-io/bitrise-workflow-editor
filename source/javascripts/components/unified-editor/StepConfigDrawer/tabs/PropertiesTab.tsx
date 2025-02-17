import { useEffect, useState } from 'react';
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
import { useDebounceCallback } from 'usehooks-ts';
import StepService from '@/core/services/StepService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import { useStepDrawerContext } from '../StepConfigDrawer.context';

type StepVersionProps = {
  variant: 'input' | 'select';
  canChangeVersion?: boolean;
  selectableVersions?: ReturnType<typeof StepService.getSelectableVersions>;
};
const StepVersion = ({ variant, canChangeVersion, selectableVersions }: StepVersionProps) => {
  const { data, stepBundleId, workflowId, stepIndex } = useStepDrawerContext();
  const [value, setValue] = useState(data?.resolvedInfo?.normalizedVersion);

  const changeStepVersionInYml = useBitriseYmlStore((s) => s.changeStepVersion);
  const debouncedChangeStepVersionInYml = useDebounceCallback(changeStepVersionInYml, 250);

  const changeStepVersionInStepBundle = useBitriseYmlStore((s) => s.changeStepVersionInStepBundle);
  const debouncedChangeStepVersionInStepBundle = useDebounceCallback(changeStepVersionInYml, 250);

  const onStepVersionChange: React.ChangeEventHandler<HTMLSelectElement | HTMLInputElement> = (e) => {
    setValue(e.target.value);

    if (variant === 'select') {
      if (workflowId) {
        changeStepVersionInYml(workflowId, stepIndex, e.target.value);
      }
      if (stepBundleId) {
        changeStepVersionInStepBundle(stepBundleId, stepIndex, e.target.value);
      }
    } else {
      if (workflowId) {
        debouncedChangeStepVersionInYml(workflowId, stepIndex, e.target.value);
      }
      if (stepBundleId) {
        debouncedChangeStepVersionInStepBundle(stepBundleId, stepIndex, e.target.value);
      }
    }
  };

  useEffect(() => {
    setValue(data?.resolvedInfo?.normalizedVersion);
  }, [data?.resolvedInfo?.normalizedVersion]);

  if (!canChangeVersion) {
    return <Input label="Version" placeholder="Always latest" isDisabled />;
  }

  if (variant === 'select') {
    return (
      <Select value={value} label="Version" backgroundSize="none" onChange={onStepVersionChange} isRequired>
        {selectableVersions?.map((s) => {
          return (
            <option key={s.value} value={s.value}>
              {s.label}
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
      defaultValue={value}
      placeholder="Always latest"
      onChange={onStepVersionChange}
      inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
    />
  );
};

const PropertiesTab = () => {
  const defaultStepLibrary = useDefaultStepLibrary();
  const { isOpen: showMore, onToggle: toggleShowMore } = useDisclosure();
  const { workflowId, stepBundleId, stepIndex, data, isLoading } = useStepDrawerContext();
  const [name, setName] = useState(data?.mergedValues?.title);

  const updateStep = useDebounceCallback(
    useBitriseYmlStore((s) => s.updateStep),
    250,
  );

  const updateStepInStepBundle = useDebounceCallback(
    useBitriseYmlStore((s) => s.updateStepInStepBundle),
    250,
  );

  const cvs = data?.cvs || '';
  const summary = data?.mergedValues?.summary;
  const description = data?.mergedValues?.description;
  const sourceUrl = data?.mergedValues?.source_code_url;

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.currentTarget.value);
    if (workflowId) {
      updateStep(workflowId, stepIndex, { title: e.currentTarget.value });
    }
    if (stepBundleId) {
      updateStepInStepBundle(stepBundleId, stepIndex, {
        title: e.currentTarget.value,
      });
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap="24">
      {(isLoading || sourceUrl) && ( // NOTE: Yes, isLoading because when step version is changed, the source code link will be removed what causes a layout shift
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
        defaultValue={name}
        placeholder="Step name"
        onChange={handleNameChange}
        inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
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
    </Box>
  );
};

export default PropertiesTab;
