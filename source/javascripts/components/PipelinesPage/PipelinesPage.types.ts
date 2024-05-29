import type { FromSchema } from 'json-schema-to-ts';

export const bitriseYmlSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://json.schemastore.org/bitrise.json',
  $ref: '#/definitions/BitriseDataModel',
  definitions: {
    AppModel: {
      properties: {
        title: {
          type: 'string',
        },
        summary: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        envs: {
          items: {
            patternProperties: {
              '.*': {
                additionalProperties: true,
              },
            },
            type: 'object',
          },
          type: 'array',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    AptGetDepModel: {
      properties: {
        name: {
          type: 'string',
        },
        bin_name: {
          type: 'string',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    BashStepToolkitModel: {
      properties: {
        entry_file: {
          type: 'string',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    BitriseDataModel: {
      required: ['format_version'],
      properties: {
        format_version: {
          type: 'string',
        },
        default_step_lib_source: {
          type: 'string',
        },
        project_type: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        summary: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        app: {
          $ref: '#/definitions/AppModel',
        },
        meta: {
          patternProperties: {
            '.*': {
              additionalProperties: true,
            },
          },
          type: 'object',
        },
        trigger_map: {
          items: {
            $ref: '#/definitions/TriggerMapItemModel',
          },
          type: 'array',
        },
        pipelines: {
          patternProperties: {
            '.*': {
              $ref: '#/definitions/PipelineModel',
            },
          },
          type: 'object',
        },
        stages: {
          patternProperties: {
            '.*': {
              $ref: '#/definitions/StageModel',
            },
          },
          type: 'object',
        },
        workflows: {
          patternProperties: {
            '.*': {
              $ref: '#/definitions/WorkflowModel',
            },
          },
          type: 'object',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    BrewDepModel: {
      properties: {
        name: {
          type: 'string',
        },
        bin_name: {
          type: 'string',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    CheckOnlyDepModel: {
      properties: {
        name: {
          type: 'string',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    DepsModel: {
      properties: {
        brew: {
          items: {
            $ref: '#/definitions/BrewDepModel',
          },
          type: 'array',
        },
        apt_get: {
          items: {
            $ref: '#/definitions/AptGetDepModel',
          },
          type: 'array',
        },
        check_only: {
          items: {
            $ref: '#/definitions/CheckOnlyDepModel',
          },
          type: 'array',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    GoStepToolkitModel: {
      required: ['package_name'],
      properties: {
        package_name: {
          type: 'string',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    PipelineModel: {
      properties: {
        title: {
          type: 'string',
        },
        summary: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        stages: {
          items: {
            patternProperties: {
              '.*': {
                $ref: '#/definitions/StageModel',
              },
            },
            type: 'object',
          },
          type: 'array',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    StageModel: {
      properties: {
        title: {
          type: 'string',
        },
        summary: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        abort_on_fail: {
          type: 'boolean',
        },
        should_always_run: {
          type: 'boolean',
        },
        workflows: {
          items: {
            patternProperties: {
              '.*': {
                $ref: '#/definitions/WorkflowStageConfigModel',
              },
            },
            type: 'object',
          },
          type: 'array',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    StepModel: {
      properties: {
        title: {
          type: 'string',
        },
        summary: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        website: {
          type: 'string',
        },
        source_code_url: {
          type: 'string',
        },
        support_url: {
          type: 'string',
        },
        published_at: {
          type: 'string',
          format: 'date-time',
        },
        source: {
          $ref: '#/definitions/StepSourceModel',
        },
        asset_urls: {
          patternProperties: {
            '.*': {
              type: 'string',
            },
          },
          type: 'object',
        },
        host_os_tags: {
          items: {
            type: 'string',
          },
          type: 'array',
        },
        project_type_tags: {
          items: {
            type: 'string',
          },
          type: 'array',
        },
        type_tags: {
          items: {
            type: 'string',
          },
          type: 'array',
        },
        toolkit: {
          $ref: '#/definitions/StepToolkitModel',
        },
        deps: {
          $ref: '#/definitions/DepsModel',
        },
        is_requires_admin_user: {
          type: 'boolean',
        },
        is_always_run: {
          type: 'boolean',
        },
        is_skippable: {
          type: 'boolean',
        },
        run_if: {
          type: 'string',
        },
        timeout: {
          type: 'integer',
        },
        no_output_timeout: {
          type: 'integer',
        },
        meta: {
          patternProperties: {
            '.*': {
              additionalProperties: true,
            },
          },
          type: 'object',
        },
        inputs: {
          items: {
            patternProperties: {
              '.*': {
                additionalProperties: true,
              },
            },
            type: 'object',
          },
          type: 'array',
        },
        outputs: {
          items: {
            patternProperties: {
              '.*': {
                additionalProperties: true,
              },
            },
            type: 'object',
          },
          type: 'array',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    StepSourceModel: {
      properties: {
        git: {
          type: 'string',
        },
        commit: {
          type: 'string',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    StepToolkitModel: {
      properties: {
        bash: {
          $ref: '#/definitions/BashStepToolkitModel',
        },
        go: {
          $ref: '#/definitions/GoStepToolkitModel',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    TriggerMapItemModelRegexCondition: {
      properties: {
        regex: {
          type: 'string',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    TriggerMapItemModel: {
      properties: {
        type: {
          type: 'string',
          enum: ['push', 'pull_request', 'tag'],
        },
        enabled: {
          type: 'boolean',
        },
        pipeline: {
          type: 'string',
        },
        workflow: {
          type: 'string',
        },

        push_branch: {
          oneOf: [{ $ref: '#/definitions/TriggerMapItemModelRegexCondition' }, { type: 'string' }],
        },
        commit_message: {
          oneOf: [{ $ref: '#/definitions/TriggerMapItemModelRegexCondition' }, { type: 'string' }],
        },
        changed_files: {
          oneOf: [{ $ref: '#/definitions/TriggerMapItemModelRegexCondition' }, { type: 'string' }],
        },

        pull_request_source_branch: {
          oneOf: [{ $ref: '#/definitions/TriggerMapItemModelRegexCondition' }, { type: 'string' }],
        },
        pull_request_target_branch: {
          oneOf: [{ $ref: '#/definitions/TriggerMapItemModelRegexCondition' }, { type: 'string' }],
        },
        draft_pull_request_enabled: {
          type: 'boolean',
        },
        pull_request_label: {
          oneOf: [{ $ref: '#/definitions/TriggerMapItemModelRegexCondition' }, { type: 'string' }],
        },
        pull_request_comment: {
          oneOf: [{ $ref: '#/definitions/TriggerMapItemModelRegexCondition' }, { type: 'string' }],
        },

        tag: {
          oneOf: [{ $ref: '#/definitions/TriggerMapItemModelRegexCondition' }, { type: 'string' }],
        },

        pattern: {
          type: 'string',
        },
        is_pull_request_allowed: {
          type: 'boolean',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    WorkflowStageConfigModel: {
      properties: {
        run_if: {
          type: 'string',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
    WorkflowModel: {
      properties: {
        title: {
          type: 'string',
        },
        summary: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        before_run: {
          items: {
            type: 'string',
          },
          type: 'array',
        },
        after_run: {
          items: {
            type: 'string',
          },
          type: 'array',
        },
        envs: {
          items: {
            patternProperties: {
              '.*': {
                additionalProperties: true,
              },
            },
            type: 'object',
          },
          type: 'array',
        },
        steps: {
          items: {
            patternProperties: {
              '.*': {
                $ref: '#/definitions/StepModel',
              },
            },
            type: 'object',
          },
          type: 'array',
        },
        meta: {
          patternProperties: {
            '.*': {
              additionalProperties: true,
            },
          },
          type: 'object',
        },
      },
      additionalProperties: false,
      type: 'object',
    },
  },
} as const;

export type BitriseYml = FromSchema<typeof bitriseYmlSchema>;
export type Meta = Required<BitriseYml>['meta'] & {
  'bitrise.io'?: { stack: string; machine_type_id: string };
};
export type Pipelines = Required<BitriseYml>['pipelines'];
export type Pipeline = Pipelines[string];
export type Stages = Required<BitriseYml>['stages'];
export type Stage = Stages[string];
export type Workflow = Required<BitriseYml>['workflows'][string] & {
  meta?: Meta;
};
export type Step = Required<Workflow>['steps'][number][string];
