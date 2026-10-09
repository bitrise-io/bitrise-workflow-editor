import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

/**
 * Picks `label` in a Bitkit select. One click each, so a click that gets dropped fails the test
 * instead of being retried away. The select hands focus back to its trigger a frame after it closes,
 * so that is awaited too, or it would blur whatever the test focuses next.
 */
export async function selectOption(user: UserEvent, select: HTMLElement, label: string) {
  await user.click(select);
  await user.click(await screen.findByRole('option', { name: label }));
  await waitFor(() => {
    if (!select.textContent?.includes(label) || document.activeElement !== select) {
      throw new Error(`${label} is not selected with focus back on the select yet`);
    }
  });
}
