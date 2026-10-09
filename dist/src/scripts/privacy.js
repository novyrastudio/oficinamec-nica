import { siteConfig } from "./config.js";
import { initConsentManager } from "./consent.js";
import { initNavigation } from "./navigation.js";
import { initQuoteModal } from "./quote-modal.js";
import {
  renderGlobalContent,
  renderPrivacyPlaceholders
} from "./render.js";
import { applySeo } from "./seo.js";

applySeo();
renderGlobalContent(siteConfig);
renderPrivacyPlaceholders(siteConfig);
initNavigation();
initQuoteModal(siteConfig);
initConsentManager(siteConfig);
