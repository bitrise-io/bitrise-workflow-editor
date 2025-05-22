import { Document, isDocument, parse, Scalar, stringify, visit } from 'yaml';

import { BitriseYml } from '@/core/models/BitriseYml';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

import Client from './client';

const CI_CONFIG_VERSION_HEADER = 'Bitrise-Config-Version';

// TRANSFORMATIONS

// NOTE: When the value is a string and contains a tab characters, the eemeli/yaml
// will stringify it as multi-line block string, but keep the tab characters. It's not optimal
// for us, because it's not a valid YAML for the Bitrise CLI. So we need to keep the single
// line string with double quotes. This is a workaround for the issue.
function tabbedValueReplacer(_: unknown, value: unknown) {
  if (typeof value === 'string' && /\t/.test(value)) {
    const scalar = new Scalar(value);
    scalar.type = 'QUOTE_DOUBLE';
    return scalar;
  }

  return value;
}

/**
 * Detects the YAML styles used in the document.
 * It checks for the following styles:
 * - Indentation style for block sequences
 * - Padding style for flow collections
 */
function detectYmlStyles(doc: Document) {
  let indents = 0;
  let paddings = 0;

  visit(doc, {
    Node(_, { srcToken }) {
      if (srcToken?.type === 'flow-collection') {
        const startOffset = srcToken.start.offset;
        const endOffset = srcToken.end.find((s) => ['flow-map-end', 'flow-seq-end'].includes(s.type))?.offset ?? 0;

        if (endOffset - startOffset > 2) {
          paddings += srcToken.items.some((item) => item.start.some((s) => s.type === 'space')) ? 1 : -1;
        }
      }
      if (srcToken?.type === 'block-map') {
        srcToken.items.forEach((blockMapItem) => {
          if (blockMapItem.value?.type === 'block-seq') {
            blockMapItem.value.items.forEach((item) => {
              indents += item.start.some((s) => s.type === 'seq-item-ind' && s.indent > srcToken.indent) ? 1 : -1;
            });
          }
        });
      }
    },
  });

  return {
    indentSeq: indents > 0,
    flowCollectionPadding: paddings >= 0,
  };
}

function toYml(model?: unknown): string {
  if (!model) {
    return '';
  }

  if (typeof model === 'string') {
    return model;
  }

  let ymlStyleOptions = {
    indentSeq: true,
    flowCollectionPadding: true,
  };

  if (isDocument(model)) {
    ymlStyleOptions = detectYmlStyles(model);
  }

  return stringify(model, tabbedValueReplacer, {
    version: '1.1',
    schema: 'yaml-1.1',
    aliasDuplicateObjects: false,
    ...ymlStyleOptions,
  });
}

function fromYml(yml: string): BitriseYml {
  if (!yml) {
    return { format_version: '' };
  }

  return parse(yml);
}

type GetCiConfigOptions = {
  projectSlug: string;
  signal?: AbortSignal;
  forceToReadFromRepo?: boolean;
};

type GetCiConfigResult = {
  ymlString: string;
  version: string;
};

type SaveCiConfigOptions = {
  data: string;
  version?: string;
  projectSlug: string;
  tabOpenDuringSave?: string;
};

// API CALLS
const FORMAT_YML_PATH = `/api/cli/format`;
const BITRISE_YML_PATH = `/api/app/:projectSlug/config.yml`;
const LOCAL_BITRISE_YML_PATH = `/api/bitrise-yml`;

function ciConfigPath({ projectSlug, forceToReadFromRepo }: Omit<GetCiConfigOptions, 'signal'>) {
  const basePath = RuntimeUtils.isWebsiteMode()
    ? BITRISE_YML_PATH.replace(':projectSlug', projectSlug)
    : LOCAL_BITRISE_YML_PATH;

  return [basePath, forceToReadFromRepo ? '?is_force_from_repo=1' : ''].join('');
}

async function getCiConfig({ signal, ...options }: GetCiConfigOptions): Promise<GetCiConfigResult> {
  const path = ciConfigPath(options);
  const response = await Client.raw(path, { signal, method: 'GET' });

  return {
    ymlString: await response.text(),
    version: response.headers.get(CI_CONFIG_VERSION_HEADER) || '',
  };
}

async function saveCiConfig({ data, version, tabOpenDuringSave, projectSlug }: SaveCiConfigOptions) {
  const path = ciConfigPath({ projectSlug });
  const headers: HeadersInit = version ? { [CI_CONFIG_VERSION_HEADER]: version } : {};

  if (RuntimeUtils.isWebsiteMode()) {
    return Client.post(path, {
      headers,
      body: JSON.stringify({
        app_config_datastore_yaml: data,
        tab_open_during_save: tabOpenDuringSave,
      }),
    });
  }

  return Client.post(path, {
    headers,
    body: JSON.stringify({
      bitrise_yml: data,
    }),
  });
}

async function formatCiConfig(data: string, signal?: AbortSignal): Promise<string> {
  const response = await Client.text(FORMAT_YML_PATH, {
    signal,
    body: JSON.stringify({
      app_config_datastore_yaml: data,
    }),
    headers: {
      Accept: 'application/x-yaml, application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  return response || toYml(data);
}

export type { GetCiConfigResult };

export default {
  toYml,
  fromYml,
  getCiConfig,
  ciConfigPath,
  saveCiConfig,
  formatCiConfig,
  FORMAT_YML_PATH,
};
