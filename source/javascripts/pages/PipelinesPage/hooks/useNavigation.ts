const useNavigation = () => {
  const replace = (path: string) => {
    window.dispatchEvent(new CustomEvent('navigation.replace', { detail: { path } }));
  };

  return { replace };
};

export default useNavigation;
