import {
  getActiveServices,
  siteConfig
} from "./config.js";
import { icon } from "./icons.js";
import {
  buildDefaultWhatsAppUrl,
  isConfiguredWhatsApp
} from "./whatsapp.js";

function text(value) {
  return String(value ?? "");
}

function isPrivacyPage() {
  return window.location.pathname.includes("/privacidade");
}

function homeHref(hash = "") {
  return isPrivacyPage() ? `../index.html${hash}` : hash || "./index.html";
}

function privacyHref() {
  return isPrivacyPage() ? "./index.html" : "./privacidade/index.html";
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
}

export function renderGlobalContent(config = siteConfig) {
  setText("[data-brand-name]", config.brand.logoText || config.brand.name);
  setText("[data-footer-description]", config.brand.description);
  setText("[data-current-year]", new Date().getFullYear());

  const footerServices = document.querySelector("[data-footer-services]");
  if (footerServices) {
    const heading = footerServices.querySelector("h2")?.outerHTML || "";
    footerServices.innerHTML =
      heading +
      getActiveServices(config)
        .slice(0, 6)
        .map(
          (service) =>
            `<a href="${homeHref("#servicos")}" data-open-quote data-service-id="${service.id}">${text(service.title)}</a>`
        )
        .join("");
  }
}

export function renderDifferentials(config = siteConfig) {
  const container = document.querySelector("[data-differentials]");
  if (!container) return;

  const icons = ["diagnostic", "checkup", "engine", "wheel"];
  container.innerHTML = config.differentials
    .map(
      (item, index) => `
        <article class="differential-item" data-reveal>
          ${icon(icons[index] || "diagnostic")}
          <h2>${text(item.title)}</h2>
          <p>${text(item.description)}</p>
        </article>
      `
    )
    .join("");
}

export function renderServices(config = siteConfig) {
  const container = document.querySelector("[data-services]");
  if (!container) return;

  container.innerHTML = getActiveServices(config)
    .map(
      (service) => `
        <article class="service-card" data-reveal>
          <div>
            <span class="service-card__icon">${icon(service.icon)}</span>
            <h3>${text(service.title)}</h3>
            <p>${text(service.description)}</p>
          </div>
          <button class="service-card__button" type="button" data-open-quote data-service-id="${service.id}">
            Solicitar orçamento
          </button>
        </article>
      `
    )
    .join("");
}

export function renderAbout(config = siteConfig) {
  const container = document.querySelector("[data-about-content]");
  if (!container) return;

  container.innerHTML = `
    <p>${text(config.about.intro)}</p>
    <p>${text(config.about.history)}</p>
    <ul class="about-list">
      ${config.about.topics.map((topic) => `<li>${text(topic)}</li>`).join("")}
    </ul>
  `;
}

export function renderProcess(config = siteConfig) {
  const container = document.querySelector("[data-process]");
  if (!container) return;

  container.innerHTML = config.process
    .map(
      (step, index) => `
        <li class="process-card" data-reveal>
          <span aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <h3>${text(step.title)}</h3>
          <p>${text(step.description)}</p>
        </li>
      `
    )
    .join("");
}

export function renderGallery(config = siteConfig) {
  const container = document.querySelector("[data-gallery]");
  if (!container) return;

  container.innerHTML = config.gallery
    .map(
      (item, index) => `
        <button class="gallery-item" type="button" data-gallery-index="${index}" data-reveal aria-label="Ampliar imagem: ${text(item.title)}">
          <img src="${item.src}" alt="${text(item.alt)}" loading="lazy" decoding="async">
          <span>${text(item.title)}</span>
        </button>
      `
    )
    .join("");
}

export function renderReviews(config = siteConfig) {
  const section = document.querySelector("[data-reviews-section]");
  const container = document.querySelector("[data-reviews]");
  if (!section || !container) return;

  const reviews = config.reviews.length
    ? config.reviews
    : config.demoMode
      ? config.demoReviews
      : [];

  if (!reviews.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  container.innerHTML = reviews
    .map(
      (review) => `
        <figure class="review-card" data-reveal>
          ${config.reviews.length ? "" : '<span class="review-card__badge">Demonstração</span>'}
          <blockquote>${text(review.text)}</blockquote>
          <figcaption>
            <strong>${text(review.name)}</strong>
            <span>${review.rating ? ` • ${text(review.rating)}` : ""}</span>
            ${
              review.sourceUrl
                ? `<br><a href="${review.sourceUrl}" target="_blank" rel="noopener noreferrer">Fonte original</a>`
                : ""
            }
          </figcaption>
        </figure>
      `
    )
    .join("");
}

export function renderFaq(config = siteConfig) {
  const container = document.querySelector("[data-faq]");
  if (!container) return;

  container.innerHTML = config.faq
    .map(
      (item, index) => {
        const buttonId = `faq-button-${index}`;
        const panelId = `faq-panel-${index}`;
        return `
          <div class="faq-item">
            <button class="faq-question" type="button" id="${buttonId}" aria-expanded="false" aria-controls="${panelId}">
              <span>${text(item.question)}</span>
              ${icon("plus")}
            </button>
            <div class="faq-answer" id="${panelId}" role="region" aria-labelledby="${buttonId}" hidden>
              <div><p>${text(item.answer)}</p></div>
            </div>
          </div>
        `;
      }
    )
    .join("");
}

function renderContactValue(label, value) {
  if (!value) return "";
  return `
    <div>
      <dt>${label}</dt>
      <dd>${value}</dd>
    </div>
  `;
}

export function renderContact(config = siteConfig) {
  const container = document.querySelector("[data-contact]");
  if (!container) return;

  const address = config.contact.address;
  const addressParts = [
    address.street,
    address.district,
    address.city && address.state
      ? `${address.city} - ${address.state}`
      : address.city || address.state,
    address.postalCode
  ].filter(Boolean);

  const hasAddress = addressParts.length > 0;
  const hasHours = config.contact.hours.length > 0;
  const configuredWhatsApp = isConfiguredWhatsApp(config.contact.whatsapp);
  const demoNotice = config.demoMode
    ? "Dado demonstrativo: preencher na configuração antes da publicação."
    : "";

  const whatsappMarkup = configuredWhatsApp
    ? `<a href="${buildDefaultWhatsAppUrl(config)}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>`
    : demoNotice;

  const mapsMarkup = address.mapsUrl
    ? `<a href="${address.mapsUrl}" target="_blank" rel="noopener noreferrer">Abrir no Google Maps</a>`
    : config.demoMode
      ? "Mapa pendente de configuração."
      : "";

  container.innerHTML = `
    <dl class="contact-list">
      ${renderContactValue("Endereço", hasAddress ? addressParts.join("<br>") : demoNotice)}
      ${renderContactValue("Cidade e estado", address.city || address.state ? `${address.city} ${address.state}`.trim() : demoNotice)}
      ${renderContactValue("Telefone", config.contact.phone || demoNotice)}
      ${renderContactValue("WhatsApp", whatsappMarkup)}
      ${renderContactValue("Horários", hasHours ? config.contact.hours.join("<br>") : demoNotice)}
      ${renderContactValue("Mapa", mapsMarkup)}
    </dl>
  `;
}

export function renderPrivacyPlaceholders(config = siteConfig) {
  setText("[data-privacy-owner]", config.contact.privacyOwner);
  setText("[data-privacy-contact]", config.contact.privacyContact);
}

export function renderPage(config = siteConfig) {
  renderGlobalContent(config);
  renderDifferentials(config);
  renderServices(config);
  renderAbout(config);
  renderProcess(config);
  renderGallery(config);
  renderReviews(config);
  renderFaq(config);
  renderContact(config);
  renderPrivacyPlaceholders(config);
}
