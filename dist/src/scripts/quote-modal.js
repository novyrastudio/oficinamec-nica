import {
  getActiveServices,
  getServiceById,
  siteConfig,
  unknownService
} from "./config.js";
import { icon } from "./icons.js";
import {
  buildDefaultWhatsAppUrl,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatBrazilianPhone,
  isConfiguredWhatsApp,
  onlyDigits
} from "./whatsapp.js";

const emptyForm = {
  name: "",
  phone: "",
  city: "",
  description: ""
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createDialog() {
  const dialog = document.createElement("dialog");
  dialog.className = "quote-dialog";
  dialog.setAttribute("aria-label", "Solicitação de orçamento");
  document.body.append(dialog);
  return dialog;
}

function getFocusableElements(container) {
  return [
    ...container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ].filter((element) => element.offsetParent !== null);
}

export function initQuoteModal(config = siteConfig) {
  const dialog = createDialog();
  let opener = null;
  let selectedServiceId = "";
  let formState = { ...emptyForm };
  let submitting = false;

  const reset = () => {
    selectedServiceId = "";
    formState = { ...emptyForm };
    submitting = false;
  };

  const closeDialog = () => {
    dialog.close();
  };

  const getSelectedService = () =>
    getServiceById(selectedServiceId, config) || unknownService;

  const isDirty = () =>
    selectedServiceId ||
    Object.values(formState).some((value) => String(value).trim().length > 0);

  const renderStepOne = () => {
    const services = [...getActiveServices(config), unknownService];
    dialog.innerHTML = `
      <div class="quote-modal">
        <header class="modal-header">
          <div>
            <h2>Como podemos ajudar?</h2>
            <p>Selecione o serviço desejado para direcionarmos seu atendimento.</p>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="Fechar solicitação">${icon("close")}</button>
        </header>
        <div class="modal-body">
          <div class="service-picker" role="listbox" aria-label="Serviços disponíveis">
            ${services
              .map(
                (service) => `
                  <button class="service-option" type="button" data-select-service="${service.id}" aria-pressed="${selectedServiceId === service.id}">
                    ${icon(service.icon)}
                    <span>
                      <strong>${escapeHtml(service.title)}</strong>
                      <span>${escapeHtml(service.description)}</span>
                    </span>
                  </button>
                `
              )
              .join("")}
          </div>
          <p class="form-note">Os serviços são demonstrativos e editáveis. Disponibilidade e valores devem ser confirmados pela oficina.</p>
        </div>
      </div>
    `;
  };

  const fieldError = (name) => `quote-${name}-error`;

  const renderStepTwo = (errors = {}, status = "") => {
    const selected = getSelectedService();
    dialog.innerHTML = `
      <form class="quote-modal quote-form" novalidate data-quote-form>
        <header class="modal-header">
          <div>
            <h2>Seus dados de contato.</h2>
            <p>Preencha apenas o essencial para abrir a conversa no WhatsApp.</p>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="Fechar solicitação">${icon("close")}</button>
        </header>
        <div class="modal-body">
          <div class="quote-form">
            <div class="selected-service">
              <div>
                <span class="form-note">Serviço selecionado</span>
                <strong>${escapeHtml(selected.title)}</strong>
              </div>
              <button type="button" data-change-service>Alterar</button>
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="quote-name">Nome completo</label>
                <input id="quote-name" name="name" autocomplete="name" value="${escapeHtml(formState.name)}" aria-describedby="${fieldError("name")}" aria-invalid="${Boolean(errors.name)}" required>
                <span class="field-error" id="${fieldError("name")}">${errors.name || ""}</span>
              </div>
              <div class="field">
                <label for="quote-phone">Telefone ou WhatsApp</label>
                <input id="quote-phone" name="phone" inputmode="tel" autocomplete="tel" value="${escapeHtml(formState.phone)}" aria-describedby="${fieldError("phone")}" aria-invalid="${Boolean(errors.phone)}" required>
                <span class="field-error" id="${fieldError("phone")}">${errors.phone || ""}</span>
              </div>
              <div class="field field--full">
                <label for="quote-city">Cidade</label>
                <input id="quote-city" name="city" autocomplete="address-level2" value="${escapeHtml(formState.city)}" aria-describedby="${fieldError("city")}" aria-invalid="${Boolean(errors.city)}" required>
                <span class="field-error" id="${fieldError("city")}">${errors.city || ""}</span>
              </div>
              <div class="field field--full">
                <label for="quote-description">Conte um pouco sobre o que você precisa <span class="form-note">(opcional)</span></label>
                <textarea id="quote-description" name="description" rows="4">${escapeHtml(formState.description)}</textarea>
              </div>
            </div>

            <div>
              <p class="form-status" ${status ? 'role="alert"' : ""} data-form-status>${escapeHtml(status)}</p>
              <a class="fallback-link" data-whatsapp-fallback hidden target="_blank" rel="noopener noreferrer">Abrir WhatsApp manualmente</a>
            </div>

            <div class="form-actions">
              <p class="form-note">Nada digitado aqui é enviado para Analytics, publicidade, cookies ou backend.</p>
              <button class="button button--solid" type="submit" ${submitting ? "disabled" : ""}>Continuar pelo WhatsApp</button>
            </div>
          </div>
        </div>
      </form>
    `;
  };

  const captureForm = () => {
    const form = dialog.querySelector("[data-quote-form]");
    if (!form) return;
    const data = new FormData(form);
    formState = {
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      city: String(data.get("city") || ""),
      description: String(data.get("description") || "")
    };
  };

  const validate = () => {
    captureForm();
    const errors = {};

    if (formState.name.trim().length < 3) {
      errors.name = "Informe seu nome completo.";
    }

    const phoneDigits = onlyDigits(formState.phone);
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      errors.phone = "Informe um telefone brasileiro com DDD.";
    }

    if (formState.city.trim().length < 2) {
      errors.city = "Informe sua cidade.";
    }

    return errors;
  };

  const showStepTwo = () => {
    renderStepTwo();
    dialog.querySelector("#quote-name")?.focus();
  };

  const open = (trigger, serviceId = "") => {
    opener = trigger;
    reset();
    selectedServiceId = serviceId;

    if (selectedServiceId) {
      renderStepTwo();
    } else {
      renderStepOne();
    }

    dialog.showModal();
    document.body.classList.add("modal-open");
    dialog
      .querySelector("[data-select-service], input, button")
      ?.focus({ preventScroll: true });
  };

  document.addEventListener("click", (event) => {
    const quoteTrigger = event.target.closest("[data-open-quote]");
    if (quoteTrigger) {
      event.preventDefault();
      open(quoteTrigger, quoteTrigger.dataset.serviceId || "");
      return;
    }

    const closeTrigger = event.target.closest("[data-modal-close]");
    if (closeTrigger && dialog.open) {
      closeDialog();
      return;
    }

    const serviceTrigger = event.target.closest("[data-select-service]");
    if (serviceTrigger && dialog.open) {
      selectedServiceId = serviceTrigger.dataset.selectService;
      showStepTwo();
      return;
    }

    const changeTrigger = event.target.closest("[data-change-service]");
    if (changeTrigger && dialog.open) {
      captureForm();
      renderStepOne();
      dialog.querySelector("[data-select-service]")?.focus();
      return;
    }

    const floating = event.target.closest("[data-whatsapp-float]");
    if (floating) {
      event.preventDefault();
      if (isConfiguredWhatsApp(config.contact.whatsapp)) {
        const opened = window.open(buildDefaultWhatsAppUrl(config), "_blank");
        if (opened) opened.opener = null;
      } else {
        open(floating);
      }
    }
  });

  dialog.addEventListener("input", (event) => {
    if (event.target?.name === "phone") {
      event.target.value = formatBrazilianPhone(event.target.value);
    }
    captureForm();
  });

  dialog.addEventListener("submit", (event) => {
    event.preventDefault();
    if (submitting) return;

    const errors = validate();
    if (Object.keys(errors).length) {
      renderStepTwo(errors);
      const firstInvalid = dialog.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    if (!isConfiguredWhatsApp(config.contact.whatsapp)) {
      renderStepTwo(
        {},
        "O WhatsApp da empresa ainda não foi configurado. Preencha o número internacional no arquivo de configuração antes de publicar."
      );
      dialog.querySelector("[data-form-status]")?.focus?.();
      return;
    }

    submitting = true;
    const message = buildWhatsAppMessage({
      ...formState,
      service: getSelectedService().title
    });
    const url = buildWhatsAppUrl(config.contact.whatsapp.number, message);
    renderStepTwo({}, "Abrindo o WhatsApp. Confirme o envio da mensagem no aplicativo.");

    const fallback = dialog.querySelector("[data-whatsapp-fallback]");
    if (fallback) {
      fallback.href = url;
    }

    const opened = window.open(url, "_blank");
    if (opened) opened.opener = null;
    if (!opened) {
      submitting = false;
      renderStepTwo(
        {},
        "Não foi possível abrir automaticamente. Use o link abaixo para continuar pelo WhatsApp."
      );
      const nextFallback = dialog.querySelector("[data-whatsapp-fallback]");
      if (nextFallback) {
        nextFallback.href = url;
        nextFallback.hidden = false;
      }
      submitting = false;
      return;
    }

    window.setTimeout(() => {
      if (dialog.open) closeDialog();
    }, 900);
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && !isDirty()) {
      closeDialog();
    }
  });

  dialog.addEventListener("cancel", () => {
    reset();
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    reset();
    opener?.focus?.();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = getFocusableElements(dialog);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
