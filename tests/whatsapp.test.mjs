import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatBrazilianPhone,
  isConfiguredWhatsApp,
  onlyDigits
} from "../src/scripts/whatsapp.js";

test("normaliza telefone brasileiro para exibicao", () => {
  assert.equal(formatBrazilianPhone("11987654321"), "(11) 98765-4321");
  assert.equal(formatBrazilianPhone("(11) 3456-7890"), "(11) 3456-7890");
});

test("remove caracteres nao numericos", () => {
  assert.equal(onlyDigits("+55 (11) 98765-4321"), "5511987654321");
});

test("bloqueia numero demonstrativo de WhatsApp", () => {
  assert.equal(
    isConfiguredWhatsApp({ number: "5500000000000", isDemoNumber: true }),
    false
  );
  assert.equal(
    isConfiguredWhatsApp({ number: "5511987654321", isDemoNumber: false }),
    true
  );
});

test("constroi mensagem legivel para WhatsApp", () => {
  const message = buildWhatsAppMessage({
    name: "Ana Silva",
    phone: "(11) 98765-4321",
    city: "Sao Paulo",
    service: "Revisao preventiva",
    description: "Barulho ao frear"
  });

  assert.match(message, /Nome: Ana Silva/);
  assert.match(message, /Serviço desejado: Revisao preventiva/);
  assert.match(message, /Poderiam me orientar sobre o atendimento\?/);
});

test("usa URLSearchParams para codificar a mensagem", () => {
  const url = buildWhatsAppUrl("55 (11) 98765-4321", "Olá teste & revisão");
  assert.equal(
    url,
    "https://wa.me/5511987654321?text=Ol%C3%A1+teste+%26+revis%C3%A3o"
  );
});
