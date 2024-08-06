import { FromSchema } from 'json-schema-to-ts';
import { bitriseYmlSchema } from './BitriseYml.schema';

type BitriseYml = FromSchema<typeof bitriseYmlSchema>;
type Meta = Required<BitriseYml>['meta'] & {
  'bitrise.io'?: {
    stack: string;
    machine_type_id: string;
  };
};

export { BitriseYml, Meta };
