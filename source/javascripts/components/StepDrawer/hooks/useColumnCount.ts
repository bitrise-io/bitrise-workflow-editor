import { useMemo } from 'react';
import { useResponsive } from '@bitrise/bitkit';
import { Columns } from '../StepDrawer.contants';

const useColumnCount = (): number => {
  const responsive = useResponsive();
  return useMemo(() => {
    if (responsive.isWideDesktop) {
      return Columns.wideDesktop;
    }
    if (responsive.isDesktop) {
      return Columns.desktop;
    }
    if (responsive.isTablet) {
      return Columns.tablet;
    }
    return Columns.mobile;
  }, [responsive.isDesktop, responsive.isTablet, responsive.isWideDesktop]);
};

export default useColumnCount;
