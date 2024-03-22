import isEqual from 'lodash/isEqual';
import { TriggerItem } from './TriggersPage.types';

export const checkIsConditionsUsed = (currentTriggers: TriggerItem[], newTrigger: TriggerItem) => {
  const newConditions = [...newTrigger.conditions].map((condition) => {
    const modifiedCondition = { ...condition };
    if (modifiedCondition.value.trim() === '') {
      modifiedCondition.value = '*';
    }
    return modifiedCondition;
  });
  let isUsed = false;
  currentTriggers.forEach(({ conditions, id }) => {
    isUsed = isEqual(conditions, newConditions) && id !== newTrigger.id;
  });
  return isUsed;
};
