export function initFaq() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".faq-question");
    if (!button) return;

    const isExpanded = button.getAttribute("aria-expanded") === "true";
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    button.setAttribute("aria-expanded", String(!isExpanded));
    if (panel) {
      panel.hidden = isExpanded;
    }
  });
}
