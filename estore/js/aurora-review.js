(function () {
  var mainImage = document.querySelector("[data-aurora-main-image]");
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-aurora-review-color]"));
  var primaryButton = document.querySelector("[data-primary-buy]");
  var priceNode = document.querySelector("[data-aurora-price]");
  var stickyLabel = document.querySelector(".mobile-sticky-label");

  if (!mainImage || !chips.length || !primaryButton || !priceNode) return;

  function applyChip(chip) {
    var nextImage = chip.getAttribute("data-aurora-review-image");
    var nextAlt = chip.getAttribute("data-aurora-review-alt") || "Aurora Silkworm";
    var nextHref = chip.getAttribute("data-aurora-review-href");
    var nextProduct = chip.getAttribute("data-aurora-review-product");
    var nextPrice = chip.getAttribute("data-aurora-review-price") || "Best price";
    var nextPriceLabel = chip.getAttribute("data-aurora-review-price-label") || nextPrice;
    var nextLabel = chip.getAttribute("data-aurora-review-label") || chip.textContent.trim() || "Variant";

    if (nextImage) {
      mainImage.classList.add("is-swapping");
      window.setTimeout(function () {
        mainImage.src = nextImage;
        mainImage.alt = nextAlt;
        mainImage.classList.remove("is-swapping");
      }, 120);
    }

    if (nextHref) primaryButton.href = nextHref;
    if (nextProduct) primaryButton.setAttribute("data-product", nextProduct);
    primaryButton.setAttribute("data-price-label", nextPriceLabel);
    primaryButton.innerHTML =
      "Buy " + nextLabel +
      " on Amazon → <span class=\"affiliate-icon\" aria-hidden=\"true\">i</span><span class=\"sr-only\">Affiliate link</span>";

    priceNode.textContent = nextPrice;
    if (stickyLabel) {
      stickyLabel.textContent = nextPrice + " on Amazon (" + nextLabel + ")";
    }

    chips.forEach(function (item) {
      var active = item === chip;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      applyChip(chip);
    });
  });
})();
