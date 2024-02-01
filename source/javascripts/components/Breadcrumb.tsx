import { Breadcrumb as BitkitBreadcrumb, BreadcrumbLink } from "@bitrise/bitkit"

type Props = {
  appName: string;
  appPath: string;
  workspaceName: string;
  workspacePath: string;
  workflowsAndPipelinesPath: string;
}

const Breadcrumb = ({ appName, appPath, workspaceName, workspacePath, workflowsAndPipelinesPath }: Props) => {
  return (
    <BitkitBreadcrumb>
      <BreadcrumbLink href={workspacePath}>
        {workspaceName}
      </BreadcrumbLink>
      <BreadcrumbLink href={appPath}>
        {appName}
      </BreadcrumbLink>
      <BreadcrumbLink href={workflowsAndPipelinesPath}>
        Workflows & Pipelines
      </BreadcrumbLink>
      <BreadcrumbLink isCurrentPage>Workflow Editor</BreadcrumbLink>
    </BitkitBreadcrumb>
  );
}
 
export default Breadcrumb;