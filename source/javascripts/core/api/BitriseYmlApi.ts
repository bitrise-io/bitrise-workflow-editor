import { Document, Node, parse, stringify, visit } from 'yaml';

import { BitriseYml } from '@/core/models/BitriseYml';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

import Client from './client';

const CI_CONFIG_VERSION_HEADER = 'Bitrise-Config-Version';

// TRANSFORMATIONS
function toYml(model: Document | Node | null): string {
  let indents = 0;
  let paddings = 0;

  visit(model, {
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
    Scalar(__, node) {
      if (typeof node.value === 'string' && /\t/.test(node.value)) {
        // eslint-disable-next-line no-param-reassign
        node.type = 'BLOCK_LITERAL';
        // eslint-disable-next-line no-param-reassign
        node.value = node.value.replace(/\t/g, '  ');
      }
    },
  });

  return stringify(model, {
    version: '1.1',
    schema: 'yaml-1.1',
    indentSeq: indents > 0,
    aliasDuplicateObjects: false,
    flowCollectionPadding: paddings >= 0,
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

export type { GetCiConfigResult };

export default {
  toYml,
  fromYml,
  getCiConfig,
  ciConfigPath,
  saveCiConfig,
};
