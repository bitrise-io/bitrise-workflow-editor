// Clarity session recordings are masked by default, so nothing here has to opt *into* masking.
// Opting out is explicit and inherited: `data-clarity-unmask="true"` unmasks the element and its
// whole subtree. Only put it on chrome that is identical for every user and account — navigation,
// section headers, tab and button labels, table column headers, static help text, empty states.
// Never put it on (or above) anything rendering config or user input: workflow/pipeline/step-bundle
// names, step inputs, env var names/values, secrets, app names, file paths, logs. When in doubt,
// leave it off — an unmasked ancestor silently unmasks every descendant added later.
(function (c, l, a, r, i, t, y) {
  c[a] =
    c[a] ||
    function () {
      (c[a].q = c[a].q || []).push(arguments);
    };
  t = l.createElement(r);
  t.async = 1;
  t.src = `https://www.clarity.ms/tag/${i}`;
  y = l.getElementsByTagName(r)[0];
  y.parentNode.insertBefore(t, y);
})(window, document, 'clarity', 'script', 'mxdzahxph2');

export {};