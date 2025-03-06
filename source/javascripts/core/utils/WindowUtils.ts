function dataLayer() {
  return window.parent.dataLayer;
}

function instance() {
  return window.parent;
}

function location() {
  return instance().location;
}

export default {
  dataLayer,
  instance,
  location,
};
