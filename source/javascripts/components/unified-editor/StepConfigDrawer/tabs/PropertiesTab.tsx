import {
  BitkitCollapsible,
  BitkitLink,
  BitkitMarkdown,
  BitkitNativeSelect,
  BitkitTextInput,
  IconOpenInNew,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Separator } from '@chakra-ui/react/separator';
import { Text } from '@chakra-ui/react/text';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

import StepService from '@/core/services/StepService';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import { useIsReadOnlyView } from '@/hooks/useTree';
import ignore1Password from '@/utils/ignore1Password';

import { useStepDrawerContext } from '../StepConfigDrawer.context';

type StepVersionProps = {
  variant: 'input' | 'select';
  canChangeVersion?: boolean;
  selectableVersions?: ReturnType<typeof StepService.getSelectableVersions>;
};
const StepVersion = ({ variant, canChangeVersion, selectableVersions }: StepVersionProps) => {
  const { data, stepBundleId, workflowId, stepIndex } = useStepDrawerContext();
  const isReadOnlyView = useIsReadOnlyView();
  const [value, setValue] = useState(data?.resolvedInfo?.normalizedVersion);
  const [draft, setDraft] = useState<string>();
  const changeStepVersion = useDebounceCallback(StepService.changeStepVersion, 250);

  const onStepVersionChange: ChangeEventHandler<HTMLSelectElement | HTMLInputElement> = (e) => {
    setValue(e.target.value);

    const source = stepBundleId ? 'step_bundles' : 'workflows';
    const sourceId = stepBundleId || workflowId;

    changeStepVersion(source, sourceId, stepIndex, e.target.value);
  };

  useEffect(() => {
    setValue(data?.resolvedInfo?.normalizedVersion);
  }, [data?.resolvedInfo?.normalizedVersion]);

  if (!canChangeVersion) {
    return <BitkitTextInput optional label="Version" placeholder="Always latest" state="disabled" />;
  }

  if (variant === 'select') {
    return (
      <BitkitNativeSelect
        value={value}
        label="Version"
        state={isReadOnlyView ? 'disabled' : undefined}
        onChange={onStepVersionChange}
      >
        {selectableVersions?.map((s) => {
          return (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          );
        })}
      </BitkitNativeSelect>
    );
  }

  return (
    <BitkitTextInput
      optional
      label="Version"
      placeholder="Always latest"
      state={isReadOnlyView ? 'disabled' : undefined}
      value={draft ?? value ?? ''}
      onChange={(e) => {
        setDraft(e.target.value);
        onStepVersionChange(e);
      }}
      inputRef={ignore1Password}
      inputProps={{ onBlur: () => setDraft(undefined) }}
    />
  );
};

const PropertiesTab = () => {
  const isReadOnlyView = useIsReadOnlyView();
  const defaultStepLibrary = useDefaultStepLibrary();
  const updateStepField = useDebounceCallback(StepService.updateStepField, 250);
  const { workflowId, stepBundleId, stepIndex, data, isLoading } = useStepDrawerContext();
  const [title, setTitle] = useState<string>();

  const cvs = data?.cvs || '';
  const summary = data?.mergedValues?.summary;
  const description = data?.mergedValues?.description;
  const sourceUrl = data?.mergedValues?.source_code_url;

  const handleTitleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const t = e.currentTarget.value;
    const source = stepBundleId ? 'step_bundles' : 'workflows';
    const sourceId = stepBundleId || workflowId;

    setTitle(t);
    updateStepField(source, sourceId, stepIndex, 'title', t, data?.defaultValues?.title);
  };

  return (
    <Box display="flex" flexDirection="column" gap="24">
      {(isLoading || sourceUrl) && ( // NOTE: Yes, isLoading because when step version is changed, the source code link will be removed what causes a layout shift
        <BitkitLink
          alignSelf="start"
          className="source"
          colorVariant="purple"
          href={sourceUrl}
          isExternal
          suffixIcon={IconOpenInNew}
        >
          View source code
        </BitkitLink>
      )}
      <BitkitTextInput
        optional
        label="Title"
        placeholder="Step title"
        state={isReadOnlyView ? 'disabled' : undefined}
        value={title ?? data?.mergedValues?.title ?? ''}
        onChange={handleTitleChange}
        inputRef={ignore1Password}
      />
      <Separator />
      <StepVersion
        variant={StepService.isBitriseLibraryStep(cvs, defaultStepLibrary) ? 'select' : 'input'}
        canChangeVersion={StepService.canUpdateVersion(cvs, defaultStepLibrary)}
        selectableVersions={StepService.getSelectableVersions(data)}
      />
      <Separator />
      <Box display="flex" flexDirection="column" gap="8" data-e2e-tag="step-description">
        <Text textStyle="body/md/semibold">Summary</Text>
        {summary && <BitkitMarkdown size="lg">{summary}</BitkitMarkdown>}
        {description && (
          <BitkitCollapsible collapsedHeight="0px">
            <BitkitMarkdown size="lg">{description}</BitkitMarkdown>
          </BitkitCollapsible>
        )}
      </Box>
    </Box>
  );
};

export default PropertiesTab;
