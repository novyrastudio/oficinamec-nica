import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSENT_STORAGE_KEY,
  consentToGoogleMode,
  getStoredConsent,
  normalizeConsent,
  saveConsent
} from "../src/scripts/consent.js";

function memoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => store.get(key) || null,
    setItem: (key, value) => store.set(key, value)
  };
}

test("mapeia preferencias para Google Consent Mode", () => {
  assert.deepEqual(consentToGoogleMode({ analytics: true, marketing: false }), {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
});

test("normaliza preferencias booleanas", () => {
  const normalized = normalizeConsent({ analytics: 1, marketing: "" });
  assert.equal(normalized.analytics, true);
  assert.equal(normalized.marketing, false);
  assert.ok(normalized.decidedAt);
});

test("salva e le preferencias sem dados do formulario", () => {
  const storage = memoryStorage();
  saveConsent({ analytics: true, marketing: false }, storage);
  const raw = storage.getItem(CONSENT_STORAGE_KEY);
  assert.match(raw, /analytics/);
  assert.doesNotMatch(raw, /telefone|cidade|nome|descricao/i);

  const stored = getStoredConsent(storage);
  assert.equal(stored.analytics, true);
  assert.equal(stored.marketing, false);
});
