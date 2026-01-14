import { Document } from 'yaml';

import { updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

function getContainerOrThrowError(id: string, doc: Document) {
  const container = YmlUtils.getMapIn(doc, ['containers', id]);

  if (!container) {
    throw new Error(`Container ${id} not found. Ensure that the container exists in the 'containers' section.`);
  }

  return container;
}

function createExecutionContainer(id: string, image: string) {
  updateBitriseYmlDocument(({ doc }) => {
    if (doc.hasIn(['containers', id])) {
      throw new Error(`Container '${id}' already exists`);
    }

    YmlUtils.setIn(doc, ['containers', id], { image });
    return doc;
  });
}

export default {
  createExecutionContainer,
  getContainerOrThrowError,
};
