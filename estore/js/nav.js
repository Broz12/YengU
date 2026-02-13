(function () {
  function setMenuState(button, nav, open) {
    button.setAttribute("aria-expanded", open ? "true" : "false");
    button.classList.toggle("is-open", open);
    nav.classList.toggle("is-open", open);
  }

  function setupToggle(button) {
    var targetId = button.getAttribute("aria-controls");
    if (!targetId) return;

    var nav = document.getElementById(targetId);
    if (!nav) return;

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
      if (!event.target.closest(".site-header")) {
        setMenuState(button, nav, false);
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
