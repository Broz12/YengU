(function () {
  var affiliateConfig = Object.assign(
    {
      amazonTag: "",
      flipkartAffid: "",
      myntraSource: "affiliate",
      productQueries: {},
      linkOverrides: {},
    },
    window.YENGU_AFFILIATE || {}
  );

  function getFallbackQuery(productId) {
    return String(productId || "")
      .replace(/^yg-/, "")
      .replace(/-/g, " ")
      .trim();
  }

  function buildRetailerUrl(platform, productId) {
    var overrideKey = platform + ":" + productId;
    var directOverride = affiliateConfig.linkOverrides[overrideKey];
    if (directOverride) return directOverride;

    var query = affiliateConfig.productQueries[productId] || getFallbackQuery(productId);

    if (platform === "amazon") {
      var amazonUrl = new URL("https://www.amazon.in/s");
      if (query) amazonUrl.searchParams.set("k", query);
      if (affiliateConfig.amazonTag) amazonUrl.searchParams.set("tag", affiliateConfig.amazonTag);
      return amazonUrl.toString();
    }

    if (platform === "flipkart") {
      var flipkartUrl = new URL("https://www.flipkart.com/search");
      if (query) flipkartUrl.searchParams.set("q", query);
      if (affiliateConfig.flipkartAffid) flipkartUrl.searchParams.set("affid", affiliateConfig.flipkartAffid);
      return flipkartUrl.toString();
    }

    if (platform === "myntra") {
      var myntraUrl = new URL("https://www.myntra.com/");
      if (query) myntraUrl.searchParams.set("q", query);
      if (affiliateConfig.myntraSource) myntraUrl.searchParams.set("utm_source", affiliateConfig.myntraSource);
      return myntraUrl.toString();
    }

    return "";
  }

  function applyAffiliateUrls() {
    var links = document.querySelectorAll(".affiliate-link");

    links.forEach(function (link) {
      var platform = link.getAttribute("data-platform") || "";
      var productId = link.getAttribute("data-product") || "";
      if (!platform || !productId) return;

      var nextHref = buildRetailerUrl(platform, productId);
      if (nextHref) {
        link.setAttribute("href", nextHref);
      }
    });
  }

  // Track affiliate clicks for analytics attribution.
  function trackClick(platform, productId) {
    console.log("Click tracked:", platform, productId);

    if (typeof gtag !== "undefined") {
      gtag("event", "affiliate_click", {
        platform: platform,
        product_id: productId,
        event_category: "affiliate",
        event_label: platform + "_" + productId,
      });
    }

    // Emit app-level event so optional backends can persist click telemetry.
    window.dispatchEvent(
      new CustomEvent("yengu:affiliate_click", {
        detail: {
          platform: platform,
          productId: productId,
          pagePath: window.location.pathname,
        },
      })
    );
  }

  window.trackClick = trackClick;
  applyAffiliateUrls();

  document.addEventListener("click", function (event) {
    var link = event.target.closest(".affiliate-link");
    if (!link) return;

    var platform = link.getAttribute("data-platform") || "unknown";
    var productId = link.getAttribute("data-product") || "unknown";
    trackClick(platform, productId);
  });

  // Lightweight social sharing for review pages.
  var shareButtons = document.querySelectorAll("[data-share]");
  shareButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var url = window.location.href;
      var title = document.title;

      if (navigator.share) {
        navigator.share({ title: title, url: url });
        return;
      }

      var network = button.getAttribute("data-share");
      var shareUrl = "";

      if (network === "twitter") {
        shareUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(title) + "&url=" + encodeURIComponent(url);
      } else if (network === "facebook") {
        shareUrl = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
      } else if (network === "linkedin") {
        shareUrl = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url);
      } else {
        shareUrl = url;
      }

      window.open(shareUrl, "_blank", "noopener,noreferrer");
    });
  });

  // Sync the mobile sticky CTA with the primary buy button.
  var sticky = document.querySelector(".mobile-sticky");
  if (sticky) {
    var primaryButton = document.querySelector("[data-primary-buy]");
    var stickyButton = sticky.querySelector(".button");
    var stickyLabel = sticky.querySelector(".mobile-sticky-label");

    if (primaryButton && stickyButton && stickyLabel) {
      stickyButton.href = primaryButton.href;
      stickyButton.setAttribute("data-platform", primaryButton.getAttribute("data-platform"));
      stickyButton.setAttribute("data-product", primaryButton.getAttribute("data-product"));
      stickyLabel.textContent = primaryButton.getAttribute("data-price-label") || "Best price";
    }
  }
})();
