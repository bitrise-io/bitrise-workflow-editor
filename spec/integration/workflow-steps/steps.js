import $el, { elements } from '../elements';
import "../common";

afterEach(() => {
  $el(elements["Discard Button"]).then(btn => {
    if (!btn.is(':disabled')) {
      btn.click();
    }
  });
});
