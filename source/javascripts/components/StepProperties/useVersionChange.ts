import { useEffect, useReducer } from "react";
import { useDisclosure } from "@bitrise/bitkit";

import { Step } from "../../models";
import semverService from "../../services/semver-service";
import { extractInputNames, extractReleaseNotesUrl } from "./utils";

type ReducerState = {
  oldHashKey: string;
  oldVersion: string;
  oldInputNames: Array<string>;
};
const DefaultState: ReducerState = {
  oldHashKey: "",
  oldVersion: "",
  oldInputNames: [],
};

const useVersionChange = (step: Step) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [{ oldHashKey, oldVersion, oldInputNames }, dispatch] = useReducer(
    (state: ReducerState, partialState: Partial<ReducerState>) => ({
      ...state,
      ...partialState,
    }),
    DefaultState,
  );

  const isSameStep = oldHashKey === step.$$hashKey;

  // Calculate input changes between different step versions
  const newInputNames = extractInputNames(step);
  const removedInputs = oldInputNames.filter(
    (name) => !newInputNames.includes(name),
  );
  const newInputs = newInputNames.filter(
    (name) => !oldInputNames.includes(name),
  );
  const hasInputChanged = removedInputs.length > 0 || newInputs.length > 0;

  // Calculate version changes
  const newVersion = step.version;
  const isVersionChanged = Boolean(
    oldVersion && newVersion && oldVersion !== newVersion,
  );
  const isMajorChange = Boolean(
    oldVersion &&
      newVersion &&
      semverService.isMajorVersionChange(oldVersion, newVersion),
  );
  const shouldOpenChangeDialog =
    isSameStep && isVersionChanged && (isMajorChange || hasInputChanged);

  useEffect(() => {
    if (shouldOpenChangeDialog) {
      onOpen();
    }
  }, [shouldOpenChangeDialog, onOpen, newVersion]);

  useEffect(() => {
    if (!isSameStep) {
      dispatch(DefaultState);
    }
  }, [isSameStep]);

  const result = {
    isOpen,
    onClose,
    isMajorChange,
    releaseNotesUrl: extractReleaseNotesUrl(step),
    removedInputs,
    newInputs,
    createSnapshot: (state: ReducerState) => dispatch(state),
  };

  return result;
};

export default useVersionChange;
