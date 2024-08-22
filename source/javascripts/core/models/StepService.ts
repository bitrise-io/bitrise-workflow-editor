import CvsUtils from '@/core/utils/CvsUtils';

function resolveName(title?: string, info: { cvs: string; id?: string } = { cvs: '' }) {
  if (CvsUtils.isStepBundle(info?.cvs)) {
    return `Step bundle: ${info.cvs.replace('bundle::', '')}`;
  }
  if (CvsUtils.isDockerStep(info.cvs)) {
    return 'With group';
  }

  return title || info.id || info.cvs.split('/').pop() || info.cvs;
}

export default {
  resolveName,
};
