(function () {
  // Find and highlight the lowest price in each comparison table.
  function highlightBestDeal(container) {
    var options = Array.prototype.slice.call(container.querySelectorAll(".price-option"));
    if (!options.length) return;

    var best = options
      .map(function (option) {
        return {
          el: option,
          price: parseFloat(option.getAttribute("data-price")) || Infinity,
        };
      })
      .sort(function (a, b) {
        return a.price - b.price;
      })[0];

    options.forEach(function (option) {
      option.classList.remove("is-best");
    });

    if (best && best.price !== Infinity) {
      best.el.classList.add("is-best");
      var badge = best.el.querySelector(".best-badge");
      if (badge) badge.textContent = "Best Deal";
    }
  }

  document.querySelectorAll(".where-to-buy").forEach(function (container) {
    highlightBestDeal(container);
  });
})();
