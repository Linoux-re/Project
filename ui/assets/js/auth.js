import { qs, store, validateEmail, passwordStrengthHint, toast, announce } from "./util.js";
import { openModal, closeModal } from "./app.js";

const attemptStore = store("session", "pronote-login");

const LOCK_THRESHOLD = 5;
const LOCK_DURATION = 30000;

const getAttempts = () => attemptStore.get("attempts", { count: 0, lockedUntil: 0 });

const setAttempts = (value) => attemptStore.set("attempts", value);

const updateLockoutBanner = (banner, state) => {
  if (!banner) return;
  const now = Date.now();
  if (state.lockedUntil > now) {
    banner.hidden = false;
    const remaining = Math.ceil((state.lockedUntil - now) / 1000);
    banner.querySelector("span").textContent = `${remaining}s`;
  } else {
    banner.hidden = true;
  }
};

const initCapsLockIndicator = (input, indicator) => {
  input.addEventListener("keyup", (event) => {
    if (!indicator) return;
    const caps = event.getModifierState && event.getModifierState("CapsLock");
    indicator.hidden = !caps;
  });
};

const initPasswordToggle = (input, toggle) => {
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const isPassword = input.getAttribute("type") === "password";
    input.setAttribute("type", isPassword ? "text" : "password");
    toggle.setAttribute("aria-pressed", (!isPassword).toString());
    toggle.textContent = isPassword ? "Masquer" : "Afficher";
  });
};

const initForm = () => {
  const form = qs("#login-form");
  if (!form) return;
  const email = qs("#email", form);
  const password = qs("#password", form);
  const capsIndicator = qs("#caps-indicator", form);
  const policy = qs("#password-policy", form);
  const lockBanner = qs("#lockout-banner");
  const submit = qs("button[type='submit']", form);

  initCapsLockIndicator(password, capsIndicator);
  initPasswordToggle(password, qs("#password-toggle", form));

  const attempts = getAttempts();
  updateLockoutBanner(lockBanner, attempts);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const state = getAttempts();
    if (Date.now() < state.lockedUntil) {
      toast("Compte verrouillé temporairement", "warning", { description: "Réessayez dans quelques secondes." });
      return;
    }

    const emailValid = validateEmail(email.value);
    const passwordValid = password.value.length >= 10;

    if (!emailValid) {
      email.classList.add("input--invalid");
      email.setAttribute("aria-invalid", "true");
      qs("#email-error", form).hidden = false;
    } else {
      email.classList.remove("input--invalid");
      email.removeAttribute("aria-invalid");
      qs("#email-error", form).hidden = true;
    }

    if (!passwordValid) {
      password.classList.add("input--invalid");
      password.setAttribute("aria-invalid", "true");
      qs("#password-error", form).hidden = false;
      policy.textContent = passwordStrengthHint(password.value);
    } else {
      password.classList.remove("input--invalid");
      password.removeAttribute("aria-invalid");
      qs("#password-error", form).hidden = true;
      policy.textContent = passwordStrengthHint(password.value);
    }

    if (!emailValid || !passwordValid) {
      announce("Validation du formulaire échouée");
      return;
    }

    submit.disabled = true;
    submit.dataset.loading = "true";
    submit.innerHTML = '<span class="spinner" role="presentation"></span> Connexion…';

    await new Promise((resolve) => setTimeout(resolve, 900));

    // Demo: accept password "Pronote2024!"
    if (password.value !== "Pronote2024!") {
      const nextCount = state.count + 1;
      const lockedUntil = nextCount >= LOCK_THRESHOLD ? Date.now() + LOCK_DURATION : 0;
      setAttempts({ count: lockedUntil ? 0 : nextCount, lockedUntil });
      updateLockoutBanner(lockBanner, { count: 0, lockedUntil });
      submit.disabled = false;
      submit.dataset.loading = "false";
      submit.textContent = "Se connecter";
      toast("Identifiants incorrects", "danger");
      return;
    }

    setAttempts({ count: 0, lockedUntil: 0 });
    updateLockoutBanner(lockBanner, { count: 0, lockedUntil: 0 });
    submit.textContent = "Vérification 2FA";
    toast("Code 2FA requis", "default");
    openModal("modal-2fa");
    submit.disabled = false;
    submit.dataset.loading = "false";
    submit.textContent = "Se connecter";
  });

  password.addEventListener("input", () => {
    policy.textContent = passwordStrengthHint(password.value);
  });

  setInterval(() => updateLockoutBanner(lockBanner, getAttempts()), 1000);
};

const init2FA = () => {
  const form = qs("#twofa-form");
  if (!form) return;
  const otpInput = qs("#otp", form);
  const error = qs("#otp-error", form);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (otpInput.value.trim() !== "123456") {
      error.hidden = false;
      otpInput.classList.add("input--invalid");
      announce("Code 2FA invalide");
      return;
    }
    error.hidden = true;
    otpInput.classList.remove("input--invalid");
    toast("Connexion réussie !", "success");
    closeModal("modal-2fa");
    await new Promise((resolve) => setTimeout(resolve, 400));
    window.location.href = "dashboard.html";
  });
};

const initSecurityHints = () => {
  const hint = qs("#phishing-hint");
  if (hint) {
    hint.textContent = `${window.location.hostname || "pronote.demo"} – sécurité renforcée`;
  }
};

initForm();
init2FA();
initSecurityHints();
