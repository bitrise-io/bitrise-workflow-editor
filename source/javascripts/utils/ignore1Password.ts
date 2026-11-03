/**
 * Ref callback that stops 1Password from offering to fill an input.
 * Shared so the ref keeps one identity across renders.
 */
const ignore1Password = (input: HTMLInputElement | null) => {
  input?.setAttribute('data-1p-ignore', '');
};

export default ignore1Password;
