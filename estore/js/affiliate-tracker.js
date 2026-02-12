(function () {
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
  }

  window.trackClick = trackClick;

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
