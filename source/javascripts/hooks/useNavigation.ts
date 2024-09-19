const useNavigation = () => {
  const replace = (path: string) => {
    window.parent.dispatchEvent(new CustomEvent('navigation.replace', { detail: { path } }));
  };

  return { replace };
};

export default useNavigation;
