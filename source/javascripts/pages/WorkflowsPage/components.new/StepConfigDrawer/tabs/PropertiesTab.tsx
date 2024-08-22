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
import VersionUtils from '@/core/utils/VersionUtils';
import StepService from '@/core/models/StepService';
import CvsUtils from '@/core/utils/CvsUtils';
import { useStepDrawerContext } from '../StepConfigDrawer.context';

const PropertiesTab = () => {
  const { isOpen: showMore, onToggle: toggleShowMore } = useDisclosure();
  const { cvs, step } = useStepDrawerContext();

  const setOfSelectableVersions = new Set<string | null>([null, step?.versionInfo?.selectedVersion || null]);
  step?.versionInfo?.availableVersions?.forEach((version) => {
    const [major, minor] = version.split('.');
    setOfSelectableVersions.add(`${major}.x.x`);
    setOfSelectableVersions.add(`${major}.${minor}.x`);
  });

  const arrayOfSelectableVersions = Array.from(setOfSelectableVersions).sort().reverse();
  const title = StepService.resolveName(step?.title, step?.info);

  return (
    <Box display="flex" flexDirection="column" gap="24">
      {step?.source_code_url && (
        <Link
          gap="4"
          display="flex"
          target="_blank"
          alignSelf="start"
          className="source"
          alignItems="center"
          colorScheme="purple"
          rel="noreferrer noopener"
          href={step?.source_code_url}
          isExternal
        >
          <Text>View source code</Text>
          <Icon name="OpenInBrowser" />
        </Link>
      )}
      <Input defaultValue={title} type="text" label="Name" placeholder="Step name" isRequired />
      <Divider />
      <Select
        backgroundSize="none"
        label="Version updates"
        isDisabled={!CvsUtils.isStepLibStep(cvs)}
        defaultValue={step?.versionInfo?.selectedVersion}
        isRequired
      >
        {arrayOfSelectableVersions?.map((v) => {
          return (
            <option key={v || ''} value={v || ''}>
              {v ? `${v} - ${VersionUtils.getVersionRemark(v)}` : 'Always latest'}
            </option>
          );
        })}
      </Select>
      <Divider />
      <Box display="flex" flexDirection="column" gap="8" data-e2e-tag="step-description">
        <Text size="2" fontWeight="600">
          Summary
        </Text>
        {step?.summary && <MarkdownContent md={step.summary} />}
        {step?.description && (
          <>
            <Collapse in={showMore} transition={{ enter: { duration: 0.2 }, exit: { duration: 0.2 } }}>
              <MarkdownContent md={step.description} />
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
