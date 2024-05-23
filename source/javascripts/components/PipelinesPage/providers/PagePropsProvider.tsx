import { PropsWithChildren, createContext, useContext } from 'react';

type Props = PropsWithChildren<{
  defaultValue: State;
}>;

type State = {
  selectedPipeline: string;
  onSelectPipeline: (key: string) => void;
};

const Context = createContext<State>({
  selectedPipeline: '',
  onSelectPipeline: () => {},
});

const PagePropsProvider = ({ children, defaultValue }: Props) => {
  return <Context.Provider value={defaultValue}>{children}</Context.Provider>;
};

export const usePageProps = () => useContext(Context);

export default PagePropsProvider;
