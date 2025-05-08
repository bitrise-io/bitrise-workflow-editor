import { Document, isMap } from 'yaml';

import { TriggerSource, TriggerType } from '../models/Trigger';
import { updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YamlUtils from '../utils/YamlUtils';

function getSourceOrThrowError(source: TriggerSource, sourceId: string, doc: Document) {
  const entity = doc.getIn([source, sourceId]);

  if (!entity || !isMap(entity)) {
    throw new Error(`${source}.${sourceId} not found`);
  }

  return entity;
}

function getTriggerOrThrowError(
  source: TriggerSource,
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

  return trigger;
}

function updateEnabled(enabled: boolean, at: { source: TriggerSource; sourceId: string }) {
  updateBitriseYmlDocument(({ doc }) => {
    const entity = getSourceOrThrowError(at.source, at.sourceId, doc);

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

function updateTriggerEnabled(
  enabled: boolean,
  at: { source: TriggerSource; sourceId: string; triggerType: TriggerType; index: number },
) {
  updateBitriseYmlDocument(({ doc }) => {
    const trigger = getTriggerOrThrowError(at.source, at.sourceId, at.triggerType, at.index, doc);

    if (enabled) {
      YamlUtils.safeDeleteIn(
        doc,
        [at.source, at.sourceId, 'triggers', at.triggerType, at.index, 'enabled'],
        ['triggers', at.triggerType, at.index],
      );
      return doc;
    }

    trigger.flow = false;
    trigger.set('enabled', false);

    return doc;
  });
}

export default { updateEnabled, updateTriggerEnabled };
