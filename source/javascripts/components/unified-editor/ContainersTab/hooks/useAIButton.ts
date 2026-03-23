import PageProps from '@/core/utils/PageProps';
import useFeatureFlag from '@/hooks/useFeatureFlag';

type AIButtonProps = {
  isDisabled: boolean;
};

type UseAIButtonOptions = {
  isAgenticRunInProgress?: boolean;
};

type UseAIButtonResult = {
  isVisible: boolean;
  tooltipLabel: string;
  getProps: () => AIButtonProps;
};

const useAIButton = (props: UseAIButtonOptions = {}): UseAIButtonResult => {
  const { isAgenticRunInProgress = false } = props;
  const enableCiConfigExpertAgent = useFeatureFlag('enable-ci-config-expert-agent');

  const ciConfigExpert = PageProps.settings()?.ai.ciConfigExpert;
  const isEnabledByWorkspace = !!ciConfigExpert && ciConfigExpert.disabled !== 'by-workspace';
  const isVisible = enableCiConfigExpertAgent && isEnabledByWorkspace;

  let tooltipLabel = '';
  let isDisabled = false;

  if (isVisible) {
    if (isAgenticRunInProgress) {
      isDisabled = true;
      tooltipLabel = 'AI functions are not available while an agentic run is in progress.';
    } else if (ciConfigExpert?.disabled === 'by-project') {
      isDisabled = true;
      tooltipLabel = 'AI functions are disabled. Go to Project settings to turn them on.';
    } else if (ciConfigExpert?.disabled === 'unsupported') {
      isDisabled = true;
      tooltipLabel = 'AI functions are not available on your current plan.';
    }
  }

  const getProps = (): AIButtonProps => ({ isDisabled });

  return { isVisible, tooltipLabel, getProps };
};

export default useAIButton;
