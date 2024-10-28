import {
  Avatar,
  Box,
  Button,
  Card,
  CodeSnippet,
  Dialog,
  DialogBody,
  DialogFooter,
  Dot,
  Input,
  Link,
  Notification,
  Radio,
  RadioGroup,
  Text,
} from '@bitrise/bitkit';
import { Controller, FormProvider, useForm } from 'react-hook-form';
// import Favicon from '../../../../../../../../assets/images/favicon.svg';
import {
  getGitStatusReportData,
  GitStatusType,
  ProjectLevelStatusTitle,
  StatusReportType,
} from './GitStatusReport.util';

export type GitNamingPatternDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  app: any;
  statusReport: StatusReportType;
  onStatusUpdate: (status: ProjectLevelStatusTitle, template: string | null) => void;
};

type FormDataType = {
  status: GitStatusType;
  customInput: string;
};

const TOOLTIP_MAP: Record<string, string> = {
  '<event_type>': 'PR / Push / Tag',
  '<project_slug>': 'The unique identifier of your project.',
  '<project_title>': 'Optional title of your project.',
  '<target_id>': 'Triggered Workflow or Pipeline ID',
};

const GitNamingPatternDialog = (props: GitNamingPatternDialogProps) => {
  const { isOpen, onClose, app, statusReport, onStatusUpdate } = props;

  const { defaultStatus, statusMap, variables } = getGitStatusReportData(statusReport);

  const formMethods = useForm<FormDataType>({
    mode: 'all',
    values: {
      status: defaultStatus,
      customInput: statusMap.custom.template || '',
    },
  });

  const { control, handleSubmit, formState, watch } = formMethods;
  const { status, customInput } = watch();

  const previewTemplate = status === 'custom' ? customInput : statusMap[status].template;

  let previewString = previewTemplate || '';

  Object.keys(variables).forEach((variable) => {
    if (variables[variable] !== null) {
      previewString = previewString.replace(variable, variables[variable]);
    }
  });

  previewString = previewString.replace('<event_type>', 'pr');

  const previews = [];

  if (previewString?.includes('<target_id>')) {
    previews.push(previewString.replace(/<target_id>/g, 'my-workflow'));
    previews.push(previewString.replace(/<target_id>/g, 'my-pipeline'));
  } else {
    previews.push(previewString);
  }

  // const { mutate, isPending } = useMonolithApiMutation<unknown, unknown, unknown>(
  //   `/app/${app.slug}/settings/status_report_config`,
  //   'PUT',
  // );

  const onSubmit = (formData: FormDataType) => {
    let projectLevelStatusTitle: ProjectLevelStatusTitle;
    let projectLevelStatusTemplate: string | null = null;

    if (formData.status === 'projectBased') {
      projectLevelStatusTitle = statusMap.projectBased.title;
      projectLevelStatusTemplate = statusMap.projectBased.template;
    } else if (formData.status === 'targetBased') {
      projectLevelStatusTitle = statusMap.targetBased.title;
      projectLevelStatusTemplate = statusMap.targetBased.template;
    } else if (formData.status === 'custom') {
      projectLevelStatusTitle = statusMap.custom.title;
      projectLevelStatusTemplate = formData.customInput;
    }

    const payload = {
      slug: app.slug,
      project_level_status_name_template: projectLevelStatusTemplate,
    };

    console.log('payload:', payload);

    // mutate(payload, {
    //   onSuccess: () => {
    //     onStatusUpdate(projectLevelStatusTitle, projectLevelStatusTemplate);
    //     onClose();
    //   },
    // });
  };

  const validateCharacters = (value: string) => {
    const allowedPattern = /^[ A-Za-z,.():/\-_0-9<>]*$/;
    const invalidChars = Array.from(value).filter((char: string) => !allowedPattern.test(char));

    if (invalidChars.length > 0) {
      return `"${invalidChars[0]}" is not allowed. Allowed characters: A-Za-z,.():\\-_0-9<>`;
    }
    return true;
  };

  return (
    <FormProvider {...formMethods}>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title="Change default Git naming pattern"
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        // isClosable={!isPending}
      >
        <DialogBody>
          <Text textStyle="body/md/semibold" marginBlockEnd="12">
            Select default naming pattern
          </Text>
          <Controller
            control={control}
            name="status"
            render={({ field: { ref, ...rest } }) => {
              return (
                <RadioGroup display="flex" flexDir="column" gap="12" {...rest}>
                  <Radio
                    value="projectBased"
                    helperText="See the status of the latest build. Any previous build's status will be overridden."
                  >
                    Project status
                  </Radio>
                  <Radio
                    value="targetBased"
                    helperText="See the individual status for every Workflow or Pipeline that was run."
                  >
                    Target based status
                  </Radio>
                  <Radio value="custom" helperText="Customize your git status with variables.">
                    Custom pattern
                  </Radio>
                </RadioGroup>
              );
            }}
          />
          {status === 'custom' && (
            <>
              <Controller
                control={control}
                name="customInput"
                rules={{
                  minLength: 1,
                  maxLength: 100,
                  required: true,
                  validate: validateCharacters,
                }}
                render={({ field: { ref, ...fieldProps }, fieldState: { invalid, error } }) => (
                  <Input
                    label="Enter a valid string"
                    placeholder="e.g. UI tests on <workflow_ID>"
                    helperText={error ? error.message : 'You can use the following variables in your string:'}
                    marginBlockStart="24"
                    marginBlockEnd="16"
                    isRequired
                    maxLength={100}
                    withCounter
                    isInvalid={invalid}
                    errorText={invalid ? error?.message : undefined}
                    {...fieldProps}
                  />
                )}
              />
              {Object.keys(variables).map((variable) => (
                <CodeSnippet variant="inline" tooltipLabel={TOOLTIP_MAP[variable]} marginRight="8">
                  {variable}
                </CodeSnippet>
              ))}
            </>
          )}
          <Text textStyle="body/md/semibold" marginBlockEnd="4" marginBlockStart="24">
            Status report preview
          </Text>
          {status !== 'custom' && (
            <Text textStyle="body/md/regular" color="text/tertiary" marginBlockEnd="12">
              {statusMap[status].template}
            </Text>
          )}
          <Card padding="12" variant="outline">
            {previews.map((preview) => {
              return (
                <Box
                  borderTop="1px solid"
                  borderBottom="1px solid"
                  borderColor="border/minimal"
                  backgroundColor="background/secondary"
                  padding="10"
                  display="flex"
                  alignItems="center"
                  gap="8"
                >
                  <Dot backgroundColor="sys/success/bold" size={8} flexShrink="0" />
                  <Avatar name="Bitrise" variant="workspace" size="24" /* src={Favicon} */ />
                  {status === 'custom' && !previewString ? (
                    <Text textStyle="body/md/regular" color="text/tertiary">
                      Enter a valid string to see its preview
                    </Text>
                  ) : (
                    <Text textStyle="body/md/semibold" hasEllipsis>
                      {preview}
                    </Text>
                  )}
                </Box>
              );
            })}
          </Card>
          {status === 'custom' && (
            <Notification status="warning" marginBlockStart="24">
              Changing the status format will affect{' '}
              <Link href="https://devcenter.bitrise.io" isUnderlined>
                your branch protection rules. Learn more
              </Link>
            </Notification>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" /* isLoading={isPending} */ isDisabled={!(formState.isValid && formState.isDirty)}>
            Accept changes
          </Button>
        </DialogFooter>
      </Dialog>
    </FormProvider>
  );
};

export default GitNamingPatternDialog;
