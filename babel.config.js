module.exports = function (api) {
    api.cache(true);
    
    const presets = [
        [
            "@babel/preset-env",
            {
              "useBuiltIns": "usage",
              "corejs": 3,
            }
        ],
        "@babel/react",
        "@babel/preset-typescript"
    ];
    
    const plugins = [
        "angularjs-annotate",
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-proposal-optional-chaining"
    ];
    
    return { presets, plugins };
  };
  