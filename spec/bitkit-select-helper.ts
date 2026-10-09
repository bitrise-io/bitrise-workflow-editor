import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

/**
 * Opens a Bitkit select and waits for its menu to take focus, which it does a frame after opening.
 * Typing into the menu's search before that lands in the list instead, as typeahead.
 */
export async function openSelect(user: UserEvent, select: HTMLElement) {
  await user.click(select);
  await waitFor(() => {
    if (document.activeElement?.getAttribute('role') !== 'listbox') {
      throw new Error('the menu has not taken focus yet');
    }
  });
}

/**
 * Picks `label` in a Bitkit select. One click each, so a click that gets dropped fails the test
 * instead of being retried away. The select hands focus back to its trigger a frame after it closes,
 * so that is awaited too, or it would blur whatever the test focuses next.
 */
export async function selectOption(user: UserEvent, select: HTMLElement, label: string) {
  await openSelect(user, select);
  await user.click(await screen.findByRole('option', { name: label }));
  await waitFor(() => {
    if (!select.textContent?.includes(label) || document.activeElement !== select) {
      throw new Error(`${label} is not selected with focus back on the select yet`);
    }
  });
}
