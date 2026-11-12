/**
 * Ref callback that stops 1Password from offering to fill an input.
 * Shared so the ref keeps one identity across renders.
 */
const ignore1Password = (input: HTMLInputElement | HTMLTextAreaElement | null) => {
  input?.setAttribute('data-1p-ignore', '');
};

/**
 * The same opt-out as props, for a field whose ref is already taken by a react-hook-form
 * `register()` or a forwarded ref. Spread it into `textareaProps`: written inline there,
 * a `data-*` key fails the type check.
 */
export const ignore1PasswordProps = { 'data-1p-ignore': '' };

export default ignore1Password;
