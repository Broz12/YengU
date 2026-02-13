(function () {
  var showcase = document.querySelector("[data-aurora-showcase]");
  if (!showcase) return;

  var image = showcase.querySelector("[data-aurora-image]");
  var cta = showcase.querySelector("[data-aurora-cta]");
  var chips = Array.prototype.slice.call(showcase.querySelectorAll("[data-aurora-color]"));
  if (!image || !cta || !chips.length) return;

  var variants = {
    red: {
      src: "images/products/Aurora/red/red2.jpg",
      alt: "Aurora Silkworm Red",
      href: "https://amzn.in/d/03r1WIcE",
      productId: "yg-aurora-red",
      priceLabel: "₹1,299 on Amazon",
      buttonLabel: "Buy Red on Amazon",
    },
    blue: {
      src: "images/products/Aurora/blue/blue2.jpg",
      alt: "Aurora Silkworm Blue",
      href: "https://amzn.in/d/08Q9xMwW",
      productId: "yg-aurora-blue",
      priceLabel: "₹1,699 on Amazon",
      buttonLabel: "Buy Blue on Amazon",
    },
  };

  var active = "red";
  var intervalId = null;

  function applyVariant(nextColor) {
    var next = variants[nextColor];
    if (!next) return;

    active = nextColor;

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
      var isActive = chip.getAttribute("data-aurora-color") === nextColor;
      chip.classList.toggle("is-active", isActive);
      chip.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function startRotation() {
    if (intervalId) window.clearInterval(intervalId);
    intervalId = window.setInterval(function () {
      applyVariant(active === "red" ? "blue" : "red");
    }, 3800);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      applyVariant(chip.getAttribute("data-aurora-color"));
      startRotation();
    });
  });

  applyVariant(active);
  startRotation();
})();
