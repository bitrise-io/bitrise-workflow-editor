import { ComponentType, useEffect } from "react";
import {
  bitriseYmlStore,
  BitriseYmlStoreState,
} from "../source/javascripts/core/stores/BitriseYmlStore";

export const withBitriseYml = (
  initialState: BitriseYmlStoreState,
  Story: ComponentType,
) => {
  useEffect(() => {
    // Initialize the store with the provided YAML
    bitriseYmlStore.setState(initialState);

    // Reset the store when the story unmounts
    return () => {
      bitriseYmlStore.setState(bitriseYmlStore.getInitialState());
    };
  }, [initialState]);

  return <Story />;
};
