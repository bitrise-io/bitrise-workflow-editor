(function () {
  if (!('IntersectionObserver' in window)) {
    window.IntersectionObserver = function () {
      this.observe = () => undefined;
      this.unobserve = () => undefined;
    };
  }
  if (!('queryCommandSupported' in document)) {
    document.queryCommandSupported = () => true;
  }
})();
