import { siteConfig } from "./config.js";

function setMeta(selector, attribute, value) {
  if (!value) return;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    const match = selector.match(/\[(name|property)="([^"]+)"\]/);
    if (match) {
      element.setAttribute(match[1], match[2]);
    }
    document.head.append(element);
  }
  element.setAttribute(attribute, value);
}

export function applySeo(pathname = window.location.pathname) {
  const { seo, brand } = siteConfig;
  const isPrivacy = pathname.startsWith("/privacidade");
  const title = isPrivacy
    ? `Política de privacidade | ${brand.name}`
    : seo.title;
  const description = isPrivacy
    ? "Política de privacidade editável para o site, com detalhes sobre WhatsApp, cookies e preferências de medição."
    : seo.description;
  const canonicalUrl = new URL(
    isPrivacy ? "/privacidade/" : "/",
    seo.siteUrl
  ).toString();

  document.title = title;
  setMeta('meta[name="description"]', "content", description);
  setMeta('meta[property="og:title"]', "content", title);
  setMeta('meta[property="og:description"]', "content", description);
  setMeta('meta[property="og:url"]', "content", canonicalUrl);
  setMeta('meta[property="og:image"]', "content", seo.ogImage);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = canonicalUrl;

  renderStructuredData();
}

export function renderStructuredData(config = siteConfig) {
  const existing = document.getElementById("structured-data");
  existing?.remove();

  if (
    !config.seo.enableStructuredData ||
    !config.seo.realBusinessDataConfirmed
  ) {
    return;
  }

  const address = config.contact.address;
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: config.brand.name,
    url: config.seo.siteUrl
  };

  if (config.contact.phone) {
    data.telephone = config.contact.phone;
  }

  if (address.street && address.city && address.state) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.postalCode || undefined,
      addressCountry: address.country || "BR"
    };
  }

  const script = document.createElement("script");
  script.id = "structured-data";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.append(script);
}
