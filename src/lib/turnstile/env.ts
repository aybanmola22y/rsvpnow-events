export function getTurnstileSiteKey() {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
}

export function getTurnstileSecretKey() {
  return process.env.TURNSTILE_SECRET_KEY?.trim() ?? "";
}

/** Show the widget (browser). Only needs the public site key. */
export function shouldShowTurnstile() {
  return Boolean(getTurnstileSiteKey());
}

/** Enforce Siteverify on the server. Needs the secret key. */
export function shouldVerifyTurnstile() {
  return Boolean(getTurnstileSecretKey());
}
