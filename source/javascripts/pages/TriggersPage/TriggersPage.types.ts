import { ConditionType, TriggerItem } from '@/models/domain/Trigger';

export interface FormItems extends Omit<TriggerItem, 'conditions'> {
  conditions: {
    isRegex: boolean;
    type?: ConditionType | '';
    value: string;
  }[];
  isDraftPr?: boolean;
  isActive: boolean;
}
