import { EnvironmentItemModel, EnvironmentItemOptionsModel } from '@/core/models/BitriseYml';

export type FormItems = {
  key: string;
  value: string;
  opts: EnvironmentItemOptionsModel;
};

export type FormMode = 'edit' | 'append';

export type InputListItem = {
  index: number;
  input: EnvironmentItemModel;
  instanceValue?: string;
};
