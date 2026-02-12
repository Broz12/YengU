(function () {
  var config = window.YENGU_AUTH_CONFIG || {};
  var supabaseRef = window.supabase;
  var client = null;

  function getClient() {
    if (client) return client;
    if (!supabaseRef || typeof supabaseRef.createClient !== "function") return null;
    if (!config.supabaseUrl || !config.supabaseAnonKey) return null;

    client = supabaseRef.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });

    return client;
  }

  function setFormStatus(form, type, message) {
    var status = form.parentElement.querySelector("[data-form-status]");
    if (!status) return;

    status.className = "form-status";
    if (type) {
      status.classList.add("is-" + type);
    }
    status.textContent = message || "";
  }

  async function bindLeadForms() {
    var forms = document.querySelectorAll("[data-lead-form]");
    if (!forms.length) return;

    forms.forEach(function (form) {
      form.addEventListener("submit", async function (event) {
        event.preventDefault();

        var db = getClient();
        if (!db) {
          setFormStatus(form, "error", "Alerts are temporarily unavailable. Auth database is not configured yet.");
          return;
        }

        var emailInput = form.querySelector("input[name='email']");
        var email = emailInput ? emailInput.value.trim() : "";
        if (!email) {
          setFormStatus(form, "error", "Email is required.");
          return;
        }

        setFormStatus(form, "info", "Submitting...");

        var sessionResult = await db.auth.getSession();
        var session = sessionResult && sessionResult.data ? sessionResult.data.session : null;

        var payload = {
          email: email,
          product_id: form.getAttribute("data-product-id") || null,
          source_page: window.location.pathname,
          signup_type: form.getAttribute("data-signup-type") || "newsletter",
          user_id: session && session.user ? session.user.id : null,
        };

        var insertResult = await db.from("price_alert_subscriptions").insert(payload);
        if (insertResult.error) {
          setFormStatus(form, "error", insertResult.error.message || "Unable to save your subscription.");
          return;
        }

        form.reset();
        setFormStatus(form, "success", "Subscribed. You will receive alerts on the registered email.");
      });
    });
  }

  async function pushAffiliateEvent(detail) {
    var db = getClient();
    if (!db || !detail) return;

    var sessionResult = await db.auth.getSession();
    var session = sessionResult && sessionResult.data ? sessionResult.data.session : null;

    await db.from("affiliate_click_events").insert({
      platform: detail.platform || "unknown",
      product_id: detail.productId || "unknown",
      page_path: detail.pagePath || window.location.pathname,
      user_id: session && session.user ? session.user.id : null,
    });
  }

  function bindAffiliateEvents() {
    window.addEventListener("yengu:affiliate_click", function (event) {
      pushAffiliateEvent(event.detail);
    });
  }

  bindLeadForms();
  bindAffiliateEvents();
})();
