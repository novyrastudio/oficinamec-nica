import { siteConfig } from "./config.js";

export function onlyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

export function formatBrazilianPhone(value = "") {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  const area = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length <= 4) {
    return `(${area}) ${rest}`;
  }

  if (rest.length <= 8) {
    return `(${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }

  return `(${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

export function isConfiguredWhatsApp(
  whatsapp = siteConfig.contact.whatsapp
) {
  const number = onlyDigits(whatsapp?.number);
  return Boolean(
    number &&
      !whatsapp?.isDemoNumber &&
      number.length >= 11 &&
      number.length <= 15
  );
}

export function buildWhatsAppMessage({
  name,
  phone,
  city,
  service,
  description
}) {
  const lines = [
    "Olá! Gostaria de solicitar um orçamento.",
    "",
    `Nome: ${name.trim()}`,
    `Telefone: ${phone.trim()}`,
    `Cidade: ${city.trim()}`,
    `Serviço desejado: ${service.trim()}`,
    `Descrição: ${description?.trim() || "Não informada"}`,
    "",
    "Poderiam me orientar sobre o atendimento?"
  ];

  return lines.join("\n");
}

export function buildWhatsAppUrl(number, message) {
  const digits = onlyDigits(number);
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${digits}?${params.toString()}`;
}

export function buildDefaultWhatsAppUrl(config = siteConfig) {
  const message =
    config.contact.whatsapp.defaultMessage ||
    "Olá! Gostaria de solicitar orientação para o meu veículo.";
  return buildWhatsAppUrl(config.contact.whatsapp.number, message);
}
