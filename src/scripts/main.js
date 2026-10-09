import { siteConfig } from "./config.js";
import { initConsentManager } from "./consent.js";
import { initFaq } from "./faq.js";
import { initGallery } from "./gallery.js";
import { initNavigation, initRevealAnimations } from "./navigation.js";
import { initQuoteModal } from "./quote-modal.js";
import { renderPage } from "./render.js";
import { applySeo } from "./seo.js";

applySeo();
renderPage(siteConfig);
initNavigation();
initQuoteModal(siteConfig);
initGallery(siteConfig);
initFaq();
initConsentManager(siteConfig);
initRevealAnimations();
