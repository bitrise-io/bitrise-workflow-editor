import { ComponentType, useEffect } from "react";
import { BitriseYml } from "../source/javascripts/core/models/BitriseYml";
import { bitriseYmlStore } from "../source/javascripts/core/stores/BitriseYmlStore";
import { stringify } from "yaml";

export const withBitriseYml = (
  initialYml: BitriseYml,
  Story: ComponentType,
) => {
  useEffect(() => {
    // Initialize the store with the provided YAML
    bitriseYmlStore.setState({
      yml: initialYml,
      savedYml: initialYml,
      ymlString: stringify(initialYml),
      savedYmlString: stringify(initialYml),
    });

    // Reset the store when the story unmounts
    return () => {
      bitriseYmlStore.setState({
        yml: {} as BitriseYml,
        savedYml: {} as BitriseYml,
        ymlString: "",
        savedYmlString: "",
      });
    };
  }, [initialYml]);

  return <Story />;
};
