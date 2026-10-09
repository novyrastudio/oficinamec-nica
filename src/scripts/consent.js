import { siteConfig } from "./config.js";

export const CONSENT_STORAGE_KEY = "novyra_privacy_preferences_v1";

const defaultPreferences = {
  analytics: false,
  marketing: false,
  decidedAt: ""
};

let memoryConsent = null;

let tagsLoaded = {
  ga4: false,
  gtm: false
};

function getWindow() {
  return typeof window !== "undefined" ? window : undefined;
}

function readConsentCookie() {
  if (typeof document === "undefined" || typeof document.cookie !== "string") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${CONSENT_STORAGE_KEY}=`));

  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.split("=").slice(1).join("="));
  } catch {
    return null;
  }
}

function writeConsentCookie(value) {
  if (typeof document === "undefined") return;

  try {
    const maxAge = 60 * 60 * 24 * 180;
    document.cookie = `${CONSENT_STORAGE_KEY}=${encodeURIComponent(
      value
    )}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
  } catch {
    memoryConsent = value;
  }
}

export function normalizeConsent(preferences = {}) {
  return {
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    decidedAt: preferences.decidedAt || new Date().toISOString()
  };
}

export function consentToGoogleMode(preferences = defaultPreferences) {
  return {
    analytics_storage: preferences.analytics ? "granted" : "denied",
    ad_storage: preferences.marketing ? "granted" : "denied",
    ad_user_data: preferences.marketing ? "granted" : "denied",
    ad_personalization: preferences.marketing ? "granted" : "denied"
  };
}

export function getStoredConsent(storage = getWindow()?.localStorage) {
  try {
    const raw = storage?.getItem
      ? storage.getItem(CONSENT_STORAGE_KEY)
      : readConsentCookie() || memoryConsent;
    return raw ? normalizeConsent(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveConsent(
  preferences,
  storage = getWindow()?.localStorage
) {
  const normalized = normalizeConsent(preferences);
  const serialized = JSON.stringify(normalized);
  memoryConsent = serialized;

  try {
    if (storage?.setItem) {
      storage.setItem(CONSENT_STORAGE_KEY, serialized);
    } else {
      writeConsentCookie(serialized);
    }
  } catch {
    writeConsentCookie(serialized);
  }

  return normalized;
}

function ensureDataLayer() {
  const win = getWindow();
  if (!win) return;

  win.dataLayer = win.dataLayer || [];
  win.gtag =
    win.gtag ||
    function gtag() {
      win.dataLayer.push(arguments);
    };
}

export function applyGoogleConsentDefault() {
  const win = getWindow();
  if (!win) return;

  ensureDataLayer();
  win.gtag("consent", "default", {
    ...consentToGoogleMode(defaultPreferences),
    wait_for_update: 500
  });
}

function injectScript(src, id) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.append(script);
}

function loadOptionalTags(preferences, config = siteConfig) {
  if (preferences.analytics && config.analytics.ga4Id && !tagsLoaded.ga4) {
    ensureDataLayer();
    injectScript(
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
        config.analytics.ga4Id
      )}`,
      "ga4-script"
    );
    window.gtag("js", new Date());
    window.gtag("config", config.analytics.ga4Id, {
      anonymize_ip: true
    });
    tagsLoaded.ga4 = true;
  }

  const canLoadGtm =
    (preferences.analytics || preferences.marketing) && config.analytics.gtmId;

  if (canLoadGtm && !tagsLoaded.gtm) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js"
    });
    injectScript(
      `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(
        config.analytics.gtmId
      )}`,
      "gtm-script"
    );
    tagsLoaded.gtm = true;
  }
}

export function applyConsent(preferences, config = siteConfig) {
  const normalized = normalizeConsent(preferences);
  const win = getWindow();

  if (win) {
    ensureDataLayer();
    win.gtag("consent", "update", consentToGoogleMode(normalized));
    loadOptionalTags(normalized, config);
  }

  return normalized;
}

function createBanner() {
  const privacyUrl = window.location.pathname.includes("/privacidade")
    ? "./index.html"
    : "./privacidade/index.html";
  const banner = document.createElement("section");
  banner.className = "consent-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Preferências de privacidade");
  banner.innerHTML = `
    <p>
      Você escolhe sobre a medição.<br>
      Com sua autorização, usamos Analytics e mídia para entender a navegação e melhorar campanhas. Nenhum dado digitado no WhatsApp é enviado pelo site. <a href="${privacyUrl}">Ver privacidade.</a>
    </p>
    <div class="consent-actions">
      <button class="button button--solid button--small" type="button" data-consent-accept>Aceitar todos</button>
      <button class="button button--ghost button--small" type="button" data-consent-reject>Rejeitar opcionais</button>
      <button class="button button--ghost button--small" type="button" data-consent-customize aria-expanded="false">Personalizar</button>
    </div>
    <div class="consent-panel" hidden data-consent-panel>
      <label class="consent-toggle">
        <input type="checkbox" data-consent-analytics>
        <span>
          <strong>Analytics</strong>
          <span>Ajuda a medir navegação sem registrar dados do formulário de orçamento.</span>
        </span>
      </label>
      <label class="consent-toggle">
        <input type="checkbox" data-consent-marketing>
        <span>
          <strong>Publicidade e medição de campanhas</strong>
          <span>Permite tags de mídia quando IDs forem configurados.</span>
        </span>
      </label>
      <button class="button button--solid button--small" type="button" data-consent-save>Salvar preferências</button>
    </div>
  `;
  document.body.append(banner);
  return banner;
}

export function initConsentManager(config = siteConfig) {
  applyGoogleConsentDefault();

  const banner = createBanner();
  const panel = banner.querySelector("[data-consent-panel]");
  const customizeButton = banner.querySelector("[data-consent-customize]");
  const analyticsInput = banner.querySelector("[data-consent-analytics]");
  const marketingInput = banner.querySelector("[data-consent-marketing]");

  const setBannerVisibility = (visible) => {
    banner.hidden = !visible;
  };

  const showPreferences = () => {
    const stored = getStoredConsent() || defaultPreferences;
    analyticsInput.checked = stored.analytics;
    marketingInput.checked = stored.marketing;
    setBannerVisibility(true);
    panel.hidden = false;
    customizeButton.setAttribute("aria-expanded", "true");
    analyticsInput.focus();
  };

  const commit = (preferences) => {
    const saved = saveConsent(preferences);
    applyConsent(saved, config);
    setBannerVisibility(false);
  };

  const stored = getStoredConsent();
  if (stored) {
    applyConsent(stored, config);
    setBannerVisibility(false);
  } else {
    setBannerVisibility(true);
  }

  banner.querySelector("[data-consent-accept]").addEventListener("click", () => {
    commit({ analytics: true, marketing: true });
  });

  banner.querySelector("[data-consent-reject]").addEventListener("click", () => {
    commit({ analytics: false, marketing: false });
  });

  customizeButton.addEventListener("click", () => {
    const isHidden = panel.hidden;
    panel.hidden = !isHidden;
    customizeButton.setAttribute("aria-expanded", String(isHidden));
    if (isHidden) {
      const storedPreferences = getStoredConsent() || defaultPreferences;
      analyticsInput.checked = storedPreferences.analytics;
      marketingInput.checked = storedPreferences.marketing;
      analyticsInput.focus();
    }
  });

  banner.querySelector("[data-consent-save]").addEventListener("click", () => {
    commit({
      analytics: analyticsInput.checked,
      marketing: marketingInput.checked
    });
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-privacy-preferences]");
    if (!trigger) return;
    event.preventDefault();
    showPreferences();
  });

  window.addEventListener("open-consent-preferences", showPreferences);
}
