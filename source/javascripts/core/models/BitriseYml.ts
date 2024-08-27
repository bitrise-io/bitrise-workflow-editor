import { FromSchema } from 'json-schema-to-ts';
import { BitriseYmlSchema } from './BitriseYml.schema';

type BitriseYml = FromSchema<typeof BitriseYmlSchema>;
type Meta = Required<BitriseYml>['meta'] & {
  'bitrise.io'?: { stack: string; machine_type_id: string };
};

export { BitriseYml, Meta };
