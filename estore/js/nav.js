(function () {
  function setMenuState(button, nav, open) {
    button.setAttribute("aria-expanded", open ? "true" : "false");
    button.classList.toggle("is-open", open);
    nav.classList.toggle("is-open", open);
    if (!open) {
      nav.querySelectorAll(".nav-categories.is-open").forEach(function (group) {
        group.classList.remove("is-open");
        var toggle = group.querySelector(".nav-category-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    }
  }

  function wireCategoryMenus(nav) {
    nav.querySelectorAll("[data-nav-categories]").forEach(function (group) {
      var toggle = group.querySelector(".nav-category-toggle");
      if (!toggle) return;

      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", function (event) {
        event.stopPropagation();
        var isOpen = group.classList.contains("is-open");
        group.classList.toggle("is-open", !isOpen);
        toggle.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      });
    });
  }

  function setupToggle(button) {
    var targetId = button.getAttribute("aria-controls");
    if (!targetId) return;

    var nav = document.getElementById(targetId);
    if (!nav) return;

    wireCategoryMenus(nav);
    setMenuState(button, nav, false);

    button.addEventListener("click", function () {
      var isOpen = button.getAttribute("aria-expanded") === "true";
      setMenuState(button, nav, !isOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 1200px)").matches) {
          setMenuState(button, nav, false);
        }
      });
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest("[data-nav-categories]")) {
        nav.querySelectorAll(".nav-categories.is-open").forEach(function (group) {
          group.classList.remove("is-open");
          var toggle = group.querySelector(".nav-category-toggle");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        });
      }
    });

    window.addEventListener("resize", function () {
      if (!window.matchMedia("(max-width: 1200px)").matches) {
        setMenuState(button, nav, false);
      }
    });
  }

  document.querySelectorAll(".nav-toggle").forEach(setupToggle);
})();
