const useNavigation = () => {
  const replace = (path: string, params?: Record<string, string>) => {
    window.parent.dispatchEvent(new CustomEvent('navigation.replace', { detail: { path, params } }));
  };

  return { replace };
};

export default useNavigation;
