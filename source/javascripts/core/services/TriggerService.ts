import { Document, isMap } from 'yaml';

import { TriggerType } from '../models/Trigger';
import { updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YamlUtils from '../utils/YamlUtils';

type Source = 'workflows' | 'pipelines';

function getSourceOrThrowError(source: Source, sourceId: string, doc: Document) {
  const entity = doc.getIn([source, sourceId]);

  if (!entity || !isMap(entity)) {
    throw new Error(`${source}.${sourceId} not found`);
  }

  return entity;
}

function getTriggerOrThrowError(
  source: Source,
  sourceId: string,
  triggerType: TriggerType,
  index: number,
  doc: Document,
) {
  const entity = getSourceOrThrowError(source, sourceId, doc);
  const trigger = entity.getIn(['triggers', triggerType, index]);

  if (!trigger || !isMap(trigger)) {
    throw new Error(`Trigger is not found at path ${source}.${sourceId}.triggers.${triggerType}.${index}`);
  }

  return entity;
}

function updateEnabled(enabled: boolean, at: { source: Source; sourceId: string }) {
  updateBitriseYmlDocument(({ doc }) => {
    const entity = getSourceOrThrowError(at.source, at.sourceId, doc);

    // Remove triggers.enabled if it exists
    if (enabled) {
      YamlUtils.safeDeleteIn(doc, [at.source, at.sourceId, 'triggers', 'enabled'], ['triggers']);
      return doc;
    }

    entity.flow = false;
    if (!entity.has('triggers')) {
      entity.set('triggers', doc.createNode({}));
    }

    const triggers = entity.get('triggers');

    if (isMap(triggers)) {
      triggers.flow = false;
      triggers.set('enabled', false);
    }

    return doc;
  });
}

export { updateEnabled };
