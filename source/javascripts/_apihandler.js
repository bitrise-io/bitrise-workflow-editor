const isPluginMode = process.env.MODE === 'CLI' && process.env.NODE_ENV === 'prod';

function localServerPath(path) {
  if (process.env.MODE !== 'CLI') {
    return 'not_available';
  }
  return path;
}

window.onload = function () {
  if (isPluginMode) {
    cancelAPIConnectionClose();
  }
};

window.onbeforeunload = function () {
  if (isPluginMode) {
    closeAPIConnection();
  }
};

function cancelAPIConnectionClose() {
  $.ajax({
    type: 'POST',
    url: localServerPath('/api/connection'),
  });
}

function closeAPIConnection() {
  $.ajax({
    type: 'DELETE',
    url: localServerPath('/api/connection'),
  });
}
