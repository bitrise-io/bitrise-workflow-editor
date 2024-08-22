import { FromSchema } from 'json-schema-to-ts';
import { stringify } from 'yaml';
import BitriseYmlSchema from './BitriseYml.schema';

type BitriseYml = FromSchema<typeof BitriseYmlSchema>;
type Meta = Required<BitriseYml>['meta'] & {
  'bitrise.io'?: { stack: string; machine_type_id: string };
};

function toJSON(model: BitriseYml): string {
  return JSON.stringify({
    app_config_datastore_yaml: toYml(model),
  });
}

function toYml(model?: unknown): string {
  if (!model) {
    return '';
  }

  if (typeof model === 'string') {
    return model;
  }

  return `---\n${stringify(model)}`;
}

export { BitriseYml, Meta, toYml, toJSON };
