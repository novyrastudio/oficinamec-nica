import { siteConfig } from "./config.js";
import { icon } from "./icons.js";

export function initGallery(config = siteConfig) {
  if (!document.querySelector("[data-gallery]")) return;

  const dialog = document.createElement("dialog");
  dialog.className = "lightbox-dialog";
  dialog.setAttribute("aria-label", "Imagem ampliada da galeria");
  dialog.innerHTML = `
    <div class="lightbox">
      <div class="lightbox__media">
        <button class="icon-button lightbox__close" type="button" data-lightbox-close aria-label="Fechar galeria">${icon("close")}</button>
        <img data-lightbox-image alt="">
        <div class="lightbox__controls" aria-label="Controles da galeria">
          <button class="icon-button" type="button" data-lightbox-prev aria-label="Imagem anterior">${icon("arrow")}</button>
          <button class="icon-button" type="button" data-lightbox-next aria-label="Proxima imagem">${icon("arrow")}</button>
        </div>
      </div>
      <div class="lightbox__caption">
        <strong data-lightbox-title></strong>
        <span data-lightbox-count></span>
      </div>
    </div>
  `;
  document.body.append(dialog);

  const image = dialog.querySelector("[data-lightbox-image]");
  const title = dialog.querySelector("[data-lightbox-title]");
  const count = dialog.querySelector("[data-lightbox-count]");
  const close = dialog.querySelector("[data-lightbox-close]");
  const prev = dialog.querySelector("[data-lightbox-prev]");
  const next = dialog.querySelector("[data-lightbox-next]");
  let currentIndex = 0;
  let opener = null;

  const update = () => {
    const item = config.gallery[currentIndex];
    image.src = item.src;
    image.alt = item.alt;
    title.textContent = item.title;
    count.textContent = `${currentIndex + 1} / ${config.gallery.length}`;
  };

  const open = (index, trigger) => {
    currentIndex = index;
    opener = trigger;
    update();
    dialog.showModal();
    document.body.classList.add("modal-open");
    close.focus();
  };

  const closeDialog = () => {
    dialog.close();
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % config.gallery.length;
    update();
  };

  const showPrev = () => {
    currentIndex =
      (currentIndex - 1 + config.gallery.length) % config.gallery.length;
    update();
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-gallery-index]");
    if (!trigger) return;
    open(Number(trigger.dataset.galleryIndex), trigger);
  });

  close.addEventListener("click", closeDialog);
  next.addEventListener("click", showNext);
  prev.addEventListener("click", showPrev);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    opener?.focus();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") showNext();
    if (event.key === "ArrowLeft") showPrev();
  });
}
