import isEqual from 'lodash/isEqual';
import { TriggerItem } from './TriggersPage.types';

export const checkIsConditionsUsed = (currentTriggers: TriggerItem[], newTrigger: TriggerItem) => {
  let isUsed = false;
  currentTriggers.forEach(({ conditions, id }) => {
    isUsed = isEqual(conditions, newTrigger.conditions) && id !== newTrigger.id;
  });
  return isUsed;
};
