import { createContext, useContext } from 'react';

type EditabilityState = {
  isReadOnly: boolean;
};

const EditabilityContext = createContext<EditabilityState>({ isReadOnly: false });

export const useEditability = () => useContext(EditabilityContext);

export default EditabilityContext;
