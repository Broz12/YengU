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

    if (isNested) {
      return "../account.html";
    }

    return "account.html";
  }

  function authPath() {
    var isNested = window.location.pathname.indexOf("/reviews/") !== -1 ||
      window.location.pathname.indexOf("/guides/") !== -1 ||
      window.location.pathname.indexOf("/category/") !== -1;

    if (isNested) {
      return "../auth.html";
    }

    return "auth.html";
  }

  function setStatus(node, type, message) {
    if (!node) return;
    node.textContent = message || "";
    node.className = "auth-status";
    if (type) {
      node.classList.add("is-" + type);
    }
  }

  function getMessage(error, fallback) {
    if (error && error.message) return error.message;
    return fallback;
  }

  function getEmailRedirectUrl() {
    return window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/") + "account.html";
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
    var idTarget = document.getElementById("account-user-id");
    var logoutButton = document.getElementById("logout-btn");

    var sessionResult = await client.auth.getSession();
    var session = sessionResult && sessionResult.data ? sessionResult.data.session : null;

    if (!session || !session.user) {
      window.location.href = authPath() + "?mode=login";
      return;
    }

    if (emailTarget) {
      emailTarget.textContent = session.user.email || "No email";
    }

    if (idTarget) {
      idTarget.textContent = session.user.id || "Unknown";
    }

    setStatus(status, "success", "Authenticated");

    if (logoutButton) {
      logoutButton.addEventListener("click", async function () {
        setStatus(status, "info", "Signing out...");
        await client.auth.signOut();
        window.location.href = authPath();
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
