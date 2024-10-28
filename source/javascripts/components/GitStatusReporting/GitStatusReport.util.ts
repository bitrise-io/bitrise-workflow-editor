export type StatusReportType = {
  defaultProjectBasedStatusNameTemplate: string;
  defaultTargetBasedStatusNameTemplate: string;
  projectLevelCustomStatusNameTemplate: string | null;
  variables: Record<string, string | null>;
};

export type GitStatusType = 'projectBased' | 'targetBased' | 'custom';

export type ProjectLevelStatusTitle = 'Project status' | 'Target based status' | 'Custom pattern';

type StatusMapType = { title: ProjectLevelStatusTitle; template: string | null };

export const getGitStatusReportData = (statusReport: StatusReportType) => {
  const projectBased = statusReport.defaultProjectBasedStatusNameTemplate;
  const targetBased = statusReport.defaultTargetBasedStatusNameTemplate;
  const custom = statusReport.projectLevelCustomStatusNameTemplate;

  let defaultStatus: GitStatusType;
  if (!custom || custom === projectBased) {
    defaultStatus = 'projectBased';
  } else if (custom === targetBased) {
    defaultStatus = 'targetBased';
  } else {
    defaultStatus = 'custom';
  }

  const statusMap: Record<GitStatusType, StatusMapType> = {
    projectBased: { title: 'Project status', template: projectBased },
    targetBased: { title: 'Target based status', template: targetBased },
    custom: { title: 'Custom pattern', template: custom },
  };
  return { defaultStatus, statusMap, variables: statusReport.variables };
};
