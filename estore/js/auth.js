(function () {
  var config = window.YENGU_AUTH_CONFIG || {};
  var supabaseRef = window.supabase;
  var authClient = null;

  function createClient() {
    if (authClient) return authClient;
    if (!supabaseRef || typeof supabaseRef.createClient !== "function") return null;
    if (!config.supabaseUrl || !config.supabaseAnonKey) return null;

    authClient = supabaseRef.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    return authClient;
  }

  function accountPath() {
    var isNested = window.location.pathname.indexOf("/reviews/") !== -1 ||
      window.location.pathname.indexOf("/guides/") !== -1 ||
      window.location.pathname.indexOf("/category/") !== -1;

    if (isNested) return "../account.html";
    return "account.html";
  }

  function authPath() {
    var isNested = window.location.pathname.indexOf("/reviews/") !== -1 ||
      window.location.pathname.indexOf("/guides/") !== -1 ||
      window.location.pathname.indexOf("/category/") !== -1;

    if (isNested) return "../auth.html";
    return "auth.html";
  }

  function setStatus(node, type, message) {
    if (!node) return;
    node.textContent = message || "";
    node.className = "auth-status";
    if (type) node.classList.add("is-" + type);
  }

  function getMessage(error, fallback) {
    if (error && error.message) return error.message;
    return fallback;
  }

  function getEmailRedirectUrl() {
    return window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/") + "account.html";
  }

  function buildReferenceId(userId) {
    if (!userId) return "YU-000000000";

    var hash = 2166136261;
    for (var i = 0; i < userId.length; i += 1) {
      hash ^= userId.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      hash >>>= 0;
    }

    var numericRef = String(hash % 1000000000).padStart(9, "0");
    return "YU-" + numericRef;
  }

  function formatDate(isoDate) {
    if (!isoDate) return "Not available";
    var parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return "Not available";
    return parsed.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function prefKey(userId, key) {
    return "yengu:pref:" + (userId || "guest") + ":" + key;
  }

  function getPref(userId, key, fallback) {
    try {
      var value = window.localStorage.getItem(prefKey(userId, key));
      if (value === null) return fallback;
      return value === "1";
    } catch (error) {
      return fallback;
    }
  }

  function setPref(userId, key, value) {
    try {
      window.localStorage.setItem(prefKey(userId, key), value ? "1" : "0");
    } catch (error) {
      // Ignore storage errors on restricted devices.
    }
  }

  function bindPreferenceToggle(userId, status, elementId, key, defaultValue, onUpdate) {
    var input = document.getElementById(elementId);
    if (!input) return;

    input.checked = getPref(userId, key, defaultValue);
    if (typeof onUpdate === "function") onUpdate(input.checked);

    input.addEventListener("change", function () {
      setPref(userId, key, input.checked);
      if (typeof onUpdate === "function") onUpdate(input.checked);
      setStatus(status, "success", "Account preferences saved.");
    });
  }

  function renderLinkedProviders(user) {
    var target = document.getElementById("linked-providers");
    if (!target) return;

    var providers = [];
    if (user && user.app_metadata && Array.isArray(user.app_metadata.providers)) {
      providers = user.app_metadata.providers.slice();
    }

    if ((!providers || !providers.length) && user && Array.isArray(user.identities)) {
      providers = user.identities
        .map(function (identity) { return identity && identity.provider ? identity.provider : ""; })
        .filter(Boolean);
    }

    if (!providers.length) providers = ["email"];

    target.innerHTML = "";
    providers.forEach(function (provider) {
      var item = document.createElement("li");
      var normalized = provider === "email" ? "Email + Password" : provider.charAt(0).toUpperCase() + provider.slice(1);
      item.textContent = normalized + " linked";
      target.appendChild(item);
    });
  }

  function bindAuthPage(client) {
    var tabs = document.querySelectorAll(".auth-tab");
    var forms = document.querySelectorAll(".auth-form");
    var status = document.getElementById("auth-status");

    function showTab(targetId) {
      tabs.forEach(function (item) {
        var isActive = item.getAttribute("data-target") === targetId;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      forms.forEach(function (form) {
        form.hidden = form.id !== targetId;
      });

      setStatus(status, "", "");
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        showTab(tab.getAttribute("data-target"));
      });
    });

    var mode = new URLSearchParams(window.location.search).get("mode");
    if (mode === "signup") {
      showTab("sign-up-form");
    } else {
      showTab("sign-in-form");
    }

    var signInForm = document.getElementById("sign-in-form");
    var signUpForm = document.getElementById("sign-up-form");

    if (signInForm) {
      signInForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        setStatus(status, "info", "Signing you in...");

        var email = signInForm.email.value.trim();
        var password = signInForm.password.value;

        var result = await client.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (result.error) {
          var message = getMessage(result.error, "Login failed.");
          if (/email.*confirm/i.test(message)) {
            message = "Email confirmation is still enabled in Supabase. Disable it in Auth settings for instant signup/login.";
          }
          setStatus(status, "error", message);
          return;
        }

        setStatus(status, "success", "Login successful. Redirecting...");
        window.location.href = accountPath();
      });
    }

    if (signUpForm) {
      signUpForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        setStatus(status, "info", "Creating your account...");

        var email = signUpForm.email.value.trim();
        var password = signUpForm.password.value;

        var result = await client.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: getEmailRedirectUrl(),
          },
        });

        if (result.error) {
          setStatus(status, "error", getMessage(result.error, "Signup failed."));
          return;
        }

        var session = result && result.data ? result.data.session : null;
        if (session && session.user) {
          setStatus(status, "success", "Signup successful. Redirecting...");
          window.location.href = accountPath();
          return;
        }

        setStatus(status, "error", "Signup created but no active session returned. Disable email confirmation in Supabase Auth to allow immediate login.");
      });
    }
  }

  async function bindAccountPage(client) {
    var status = document.getElementById("account-status");
    var emailTarget = document.getElementById("account-email");
    var refTarget = document.getElementById("account-reference-id");
    var signInTarget = document.getElementById("account-last-signin");
    var copyRefButton = document.getElementById("copy-reference-btn");
    var logoutButton = document.getElementById("logout-btn");

    var sessionResult = await client.auth.getSession();
    var session = sessionResult && sessionResult.data ? sessionResult.data.session : null;

    if (!session || !session.user) {
      window.location.href = authPath() + "?mode=login";
      return;
    }

    if (emailTarget) emailTarget.textContent = session.user.email || "No email";

    var referenceId = buildReferenceId(session.user.id || "");
    if (refTarget) refTarget.textContent = referenceId;

    if (signInTarget) signInTarget.textContent = formatDate(session.user.last_sign_in_at);

    renderLinkedProviders(session.user);

    var userId = session.user.id || "guest";
    bindPreferenceToggle(userId, status, "consent-analytics", "consent_analytics", true);
    bindPreferenceToggle(userId, status, "consent-affiliate", "consent_affiliate", true);
    bindPreferenceToggle(userId, status, "consent-email", "consent_email", false);
    bindPreferenceToggle(userId, status, "setting-price-alerts", "price_alerts", true);
    bindPreferenceToggle(userId, status, "setting-fast-nav", "fast_nav", true);
    bindPreferenceToggle(userId, status, "setting-reduced-motion", "reduced_motion", false, function (enabled) {
      document.documentElement.style.scrollBehavior = enabled ? "auto" : "smooth";
    });

    var passwordForm = document.getElementById("password-change-form");
    if (passwordForm) {
      passwordForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        var newPasswordNode = document.getElementById("password-new");
        var confirmPasswordNode = document.getElementById("password-confirm");
        var newPassword = newPasswordNode ? newPasswordNode.value.trim() : "";
        var confirmPassword = confirmPasswordNode ? confirmPasswordNode.value.trim() : "";

        if (newPassword.length < 8) {
          setStatus(status, "error", "Password must be at least 8 characters.");
          return;
        }

        if (newPassword !== confirmPassword) {
          setStatus(status, "error", "Password confirmation does not match.");
          return;
        }

        setStatus(status, "info", "Updating password...");

        var updateResult = await client.auth.updateUser({ password: newPassword });
        if (updateResult.error) {
          setStatus(status, "error", getMessage(updateResult.error, "Unable to update password."));
          return;
        }

        passwordForm.reset();
        setStatus(status, "success", "Password updated successfully.");
      });
    }

    setStatus(status, "success", "Authenticated");

    if (copyRefButton) {
      copyRefButton.addEventListener("click", async function () {
        try {
          await navigator.clipboard.writeText(referenceId);
          setStatus(status, "success", "Reference ID copied.");
        } catch (error) {
          setStatus(status, "error", "Could not copy reference ID. Copy it manually.");
        }
      });
    }

    if (logoutButton) {
      logoutButton.addEventListener("click", async function () {
        setStatus(status, "info", "Signing out...");
        await client.auth.signOut();
        window.location.href = authPath() + "?mode=login";
      });
    }
  }

  async function init() {
    var page = document.body.getAttribute("data-page");
    if (page !== "auth" && page !== "account") return;

    var status = document.getElementById(page === "auth" ? "auth-status" : "account-status");
    var client = createClient();

    if (!client) {
      setStatus(
        status,
        "error",
        "Auth is not configured. Set supabaseUrl and supabaseAnonKey in js/auth-config.js."
      );
      return;
    }

    if (page === "auth") {
      bindAuthPage(client);
      var existing = await client.auth.getSession();
      if (existing && existing.data && existing.data.session) {
        window.location.href = accountPath();
      }
      return;
    }

    await bindAccountPage(client);
  }

  init();
})();
