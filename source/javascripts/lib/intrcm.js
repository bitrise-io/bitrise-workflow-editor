const APP_ID = import.meta.env.INTERCOM_APP_ID;

if (APP_ID) {
  window.intercomSettings = {
    app_id: APP_ID,
    ...(window.parent?.intercomSettings ?? {}),
    hide_default_launcher: true, // WFE runs in iframe and the parent app has the Intercom launcher, so we hide this one to avoid confusion.
  };

  (function () { var w = window; var ic = w.Intercom; if (typeof ic === "function") { ic('update', w.intercomSettings); } else { var d = document; var i = function () { i.c(arguments); }; i.q = []; i.c = function (args) { i.q.push(args); }; w.Intercom = i; var l = function () { var s = d.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = 'https://widget.intercom.io/widget/' + APP_ID; var x = d.getElementsByTagName('script')[0]; x.parentNode.insertBefore(s, x); }; if (document.readyState === 'complete') { l(); } else if (w.attachEvent) { w.attachEvent('onload', l); } else { w.addEventListener('load', l, false); } } })();
}

export { };