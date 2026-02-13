(function () {
  var locationRef = window.location;
  var isLocalHost = locationRef.hostname === "localhost" || locationRef.hostname === "127.0.0.1";

  if (locationRef.protocol === "http:" && locationRef.hostname && !isLocalHost) {
    window.location.replace("https://" + locationRef.host + locationRef.pathname + locationRef.search + locationRef.hash);
    return;
  }

  var url = new URL(window.location.href);
  var changed = false;

  if (url.pathname.endsWith("/index.html")) {
    url.pathname = url.pathname.replace(/index\.html$/, "");
    changed = true;
  }

  var sensitiveKeys = [
    "access_token",
    "refresh_token",
    "expires_in",
    "expires_at",
    "token_type",
    "provider_token",
    "provider_refresh_token",
  ];

  sensitiveKeys.forEach(function (key) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  });

  if (url.hash && url.hash.indexOf("=") !== -1) {
    var hashParams = new URLSearchParams(url.hash.slice(1));
    var hashChanged = false;

    sensitiveKeys.forEach(function (key) {
      if (hashParams.has(key)) {
        hashParams.delete(key);
        hashChanged = true;
      }
    });

    if (hashChanged) {
      var nextHash = hashParams.toString();
      url.hash = nextHash ? "#" + nextHash : "";
      changed = true;
    }
  }

  if (changed) {
    var cleanUrl = url.pathname + url.search + url.hash;
    window.history.replaceState({}, document.title, cleanUrl);
  }
})();
