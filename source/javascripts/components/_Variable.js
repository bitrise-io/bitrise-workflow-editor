(function () {
  angular.module('BitriseWorkflowEditor').factory('Variable', function (Meta) {
    const Variable = function (userVariableConfig, defaultVariableConfig, isKeyChangeable, shouldShowValue) {
      this.userVariableConfig = userVariableConfig;
      if (!this.userVariableConfig) {
        this.userVariableConfig = {};
      }
      this.defaultVariableConfig = defaultVariableConfig;

      this.configureMeta();

      this.isKeyChangeable = isKeyChangeable !== undefined ? isKeyChangeable : true;

      this.shouldShowValue = shouldShowValue !== undefined ? shouldShowValue : true;

      this.customProperties = {};
    };

    Variable.defaultVariableConfig = function () {
      return {
        opts: {
          is_expand: true,
          meta: {
            'bitrise.io': {
              is_expose: false,
              is_protected: false,
            },
          },
        },
      };
    };

    Variable.prototype.configureMeta = function () {
      let userMetaConfig;
      if (this.userVariableConfig.opts && this.userVariableConfig.opts.meta) {
        userMetaConfig = this.userVariableConfig.opts.meta;
      }

      let defaultMetaConfig;
      if (this.defaultVariableConfig && this.defaultVariableConfig.opts && this.defaultVariableConfig.opts.meta) {
        defaultMetaConfig = this.defaultVariableConfig.opts.meta;
      }

      this.meta = new Meta(userMetaConfig, defaultMetaConfig);
    };

    Variable.prototype.reconfigureMeta = function () {
      return this.configureMeta();
    };

    Variable.prototype.key = function (newKey) {
      const keySourceVariableConfig = !_.isEmpty(angular.copy(this.userVariableConfig))
        ? this.userVariableConfig
        : this.defaultVariableConfig;
      const oldKey = Variable.keyFromVariableConfig(keySourceVariableConfig);

      if (newKey === undefined) {
        return oldKey;
      }

      if (newKey !== oldKey) {
        const oldValue = keySourceVariableConfig[oldKey];
        this.userVariableConfig[newKey] = oldKey !== undefined ? oldValue : '';
        if (oldKey !== undefined) {
          delete this.userVariableConfig[oldKey];
        }
      }

      return newKey;
    };

    Variable.isValidKey = function (key, keyUniquenessScope) {
      if (key === undefined) {
        return undefined;
      }

      if (key.length === 0) {
        return false;
      }

      const validKeyRegexp = /^[a-zA-Z_]{1}[a-zA-Z0-9_]*$/;

      if (!validKeyRegexp.test(key)) {
        return false;
      }

      if (
        keyUniquenessScope &&
        _.filter(keyUniquenessScope, function (anotherVariable) {
          return anotherVariable.key() === key;
        }).length > 1
      ) {
        return false;
      }

      return true;
    };

    Variable.isValidValue = function (value, shouldBeNotEmpty) {
      if (value === undefined) {
        return undefined;
      }

      if (shouldBeNotEmpty && value !== null && value.match(/^(?:\s)*$/)) {
        return false;
      }

      return true;
    };

    Variable.prototype.value = function (newValue) {
      const key = this.key();

      if (newValue === undefined) {
        return this.userVariableConfig[key] !== undefined
          ? this.userVariableConfig[key]
          : this.defaultVariableConfig[key];
      }

      const hasDefaultConfig = Object.keys(this.defaultVariableConfig ?? {}).includes(key);
      const typeOfDefaultValue = hasDefaultConfig ? typeof this.defaultVariableConfig[key] : 'undefined';

      if (typeOfDefaultValue === 'undefined' && !newValue && newValue !== null) {
        this.userVariableConfig[key] = undefined;
      } else if (typeOfDefaultValue === 'number' && !Number.isNaN(Number(newValue))) {
        this.userVariableConfig[key] = Number(newValue);
      } else if (typeOfDefaultValue === 'boolean' && ['true', 'false'].includes(String(newValue))) {
        this.userVariableConfig[key] = Boolean(newValue);
      } else {
        this.userVariableConfig[key] = newValue || null;
      }

      return this.userVariableConfig[key];
    };

    Variable.prototype.title = function (newValue) {
      return optionGetterSetter(this, 'title', newValue);
    };

    Variable.prototype.category = function (newValue) {
      return optionGetterSetter(this, 'category', newValue);
    };

    Variable.prototype.summary = function (newValue) {
      return optionGetterSetter(this, 'summary', newValue);
    };

    Variable.prototype.description = function (newValue) {
      return optionGetterSetter(this, 'description', newValue);
    };

    Variable.prototype.longestDescription = function () {
      return this.description() ? this.description() : this.summary();
    };

    Variable.prototype.isExpand = function (newValue) {
      return optionGetterSetter(this, 'is_expand', newValue);
    };

    Variable.prototype.skipIfEmpty = function (newValue) {
      return optionGetterSetter(this, 'skip_if_empty', newValue);
    };

    Variable.prototype.isRequired = function (newValue) {
      return optionGetterSetter(this, 'is_required', newValue);
    };

    Variable.prototype.isSensitive = function (newValue) {
      return optionGetterSetter(this, 'is_sensitive', newValue);
    };

    Variable.prototype.isDontChangeValue = function (newValue) {
      return optionGetterSetter(this, 'is_dont_change_value', newValue);
    };

    Variable.prototype.isTemplate = function (newValue) {
      return optionGetterSetter(this, 'is_template', newValue);
    };

    Variable.prototype.valueOptions = function (newValue) {
      return optionGetterSetter(this, 'value_options', newValue);
    };

    Variable.prototype.scope = function (newValue) {
      return optionGetterSetter(this, 'scope', newValue);
    };

    Variable.keyFromVariableConfig = function (variableConfig) {
      return _.first(_.without(_.keys(angular.copy(variableConfig)), 'opts'));
    };

    Variable.prototype.isExpose = function (isExpose) {
      return metaGetterSetter(this, 'bitrise.io', 'is_expose', isExpose);
    };

    Variable.prototype.isProtected = function (isProtected) {
      return metaGetterSetter(this, 'bitrise.io', 'is_protected', isProtected);
    };

    function metaGetterSetter(variable, metaBundleID, metaKey, metaValue) {
      const isSetterMode = metaValue !== undefined;

      if (isSetterMode) {
        if (!variable.userVariableConfig.opts) {
          variable.userVariableConfig.opts = {};
        }

        if (!variable.userVariableConfig.opts.meta) {
          variable.userVariableConfig.opts.meta = {};
        }

        variable.meta.userMetaConfig = variable.userVariableConfig.opts.meta;
      }

      metaValue = variable.meta.valueGetterSetter(metaBundleID, metaKey, metaValue);

      if (isSetterMode) {
        if (angular.equals(variable.userVariableConfig.opts.meta, {})) {
          delete variable.userVariableConfig.opts.meta;
        }

        if (angular.equals(variable.userVariableConfig.opts, {})) {
          delete variable.userVariableConfig.opts;
        }
      }

      return metaValue;
    }

    function optionGetterSetter(variable, optionKey, optionValue) {
      let optionSource;

      if (variable.userVariableConfig.opts && variable.userVariableConfig.opts[optionKey] !== undefined) {
        optionSource = variable.userVariableConfig.opts;
      } else if (
        variable.defaultVariableConfig &&
        variable.defaultVariableConfig.opts &&
        variable.defaultVariableConfig.opts[optionKey] !== undefined
      ) {
        optionSource = variable.defaultVariableConfig.opts;
      }

      if (optionValue === undefined) {
        return optionSource ? optionSource[optionKey] : undefined;
      }

      const defaultKey = Variable.keyFromVariableConfig(variable.defaultVariableConfig);
      const defaultValue = variable.defaultVariableConfig ? variable.defaultVariableConfig[defaultKey] : undefined;

      if (
        !variable.defaultVariableConfig ||
        !variable.defaultVariableConfig.opts ||
        !angular.equals(optionValue, variable.defaultVariableConfig.opts[optionKey])
      ) {
        if (_.isEmpty(angular.copy(variable.userVariableConfig)) && variable.defaultVariableConfig) {
          variable.userVariableConfig[defaultKey] = defaultValue;
        }

        if (!variable.userVariableConfig.opts) {
          variable.userVariableConfig.opts = {};
        }

        variable.userVariableConfig.opts[optionKey] = optionValue;
      } else if (variable.userVariableConfig.opts) {
        if (variable.userVariableConfig.opts[optionKey] !== undefined) {
          delete variable.userVariableConfig.opts[optionKey];
        }

        if (_.isEmpty(angular.copy(variable.userVariableConfig.opts))) {
          delete variable.userVariableConfig.opts;
        }
      }

      return optionValue;
    }

    Variable.minimizeVariableConfig = function (variableConfig) {
      if (variableConfig.opts && _.isEmpty(angular.copy(variableConfig.opts))) {
        delete variableConfig.opts;
      }

      return variableConfig;
    };

    return Variable;
  });
})();
