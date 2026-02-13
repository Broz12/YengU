(function () {
  var showcase = document.querySelector("[data-aurora-showcase]");
  if (!showcase) return;

  var image = showcase.querySelector("[data-aurora-image]");
  var cta = showcase.querySelector("[data-aurora-cta]");
  var chips = Array.prototype.slice.call(showcase.querySelectorAll("[data-aurora-color]"));
  if (!image || !cta || !chips.length) return;

  function getVariant(chip) {
    return {
      color: chip.getAttribute("data-aurora-color") || "",
      src: chip.getAttribute("data-aurora-src") || "",
      alt: chip.getAttribute("data-aurora-alt") || "",
      href: chip.getAttribute("data-aurora-href") || "",
      productId: chip.getAttribute("data-aurora-product") || "",
      priceLabel: chip.getAttribute("data-aurora-price-label") || "Best price",
      buttonLabel: chip.getAttribute("data-aurora-cta-text") || "Buy on Amazon",
    };
  }

  var active = chips[0].getAttribute("data-aurora-color") || "red";
  var intervalId = null;

  function applyVariantFromChip(chip) {
    var next = getVariant(chip);
    if (!next.color || !next.src || !next.href || !next.productId) return;

    active = next.color;

    image.classList.add("is-swapping");
    window.setTimeout(function () {
      image.src = next.src;
      image.alt = next.alt;
      image.classList.remove("is-swapping");
    }, 140);

    cta.href = next.href;
    cta.setAttribute("data-product", next.productId);
    cta.setAttribute("data-price-label", next.priceLabel);
    var ctaText = cta.querySelector("[data-aurora-cta-label]");
    if (ctaText) ctaText.textContent = next.buttonLabel;

    chips.forEach(function (chip) {
      var isActive = chip.getAttribute("data-aurora-color") === next.color;
      chip.classList.toggle("is-active", isActive);
      chip.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function applyVariant(nextColor) {
    var target = null;
    chips.forEach(function (chip) {
      if (chip.getAttribute("data-aurora-color") === nextColor) {
        target = chip;
      }
    });
    if (!target) return;
    applyVariantFromChip(target);
  }

  function startRotation() {
    if (intervalId) window.clearInterval(intervalId);
    intervalId = window.setInterval(function () {
      applyVariant(active === "red" ? "blue" : "red");
    }, 3800);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      applyVariantFromChip(chip);
      startRotation();
    });
  });

  applyVariant(active);
  startRotation();
})();
