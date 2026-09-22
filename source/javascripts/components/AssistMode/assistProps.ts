import { AssistId } from './assistRegistry';

export const ASSIST_ID_ATTRIBUTE = 'data-assist-id';

/**
 * Marks an element as explainable in assisted mode. Spread onto any element or
 * style-prop-forwarding component: `<Box {...assistProps('wfe.step')}>`.
 * Same convention as the monolith's `data-assist-id` anchors.
 */
const assistProps = (id: AssistId): { 'data-assist-id': AssistId } => ({ [ASSIST_ID_ATTRIBUTE]: id });

export default assistProps;
