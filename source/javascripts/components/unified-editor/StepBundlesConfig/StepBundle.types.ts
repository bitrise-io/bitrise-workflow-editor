import { EnvironmentItemModel, EnvironmentItemOptionsModel } from '@/core/models/BitriseYml';

export type FormItems = {
  key: string;
  value: string;
  opts: EnvironmentItemOptionsModel;
};

export type InputListItem = {
  index: number;
} & EnvironmentItemModel;
