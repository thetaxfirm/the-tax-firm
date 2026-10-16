import { useEffect, useState } from "react";

/** Public values copied from Portal; no provider or private credentials. */
export function telyFormConnection(kind: "questionnaire" | "newsletter") {
  return kind === "questionnaire"
    ? {
        contextUrl: import.meta.env.VITE_TELY_QUESTIONNAIRE_CONTEXT_URL || "",
        submissionsUrl:
          import.meta.env.VITE_TELY_QUESTIONNAIRE_SUBMISSIONS_URL || "",
      }
    : {
        contextUrl: import.meta.env.VITE_TELY_NEWSLETTER_CONTEXT_URL || "",
        submissionsUrl:
          import.meta.env.VITE_TELY_NEWSLETTER_SUBMISSIONS_URL || "",
      };
}

/** Keep the native SDK's form/operation identity through React rerenders. */
export function useTelyForm(onRequested: () => void) {
  const [form, setForm] = useState<HTMLFormElement | null>(null);
  useEffect(() => {
    if (!form) return;
    const acknowledged = () => onRequested();
    form.addEventListener("tely-cta:requested", acknowledged);
    const src = import.meta.env.VITE_TELY_EMBED_SCRIPT_URL;
    let script = document.querySelector<HTMLScriptElement>(
      "script[data-tely-native-sdk]"
    );
    const unavailable = () => {
      if (script) script.dataset.telyFailed = "true";
      const status = form.querySelector("[data-tely-status]");
      if (status)
        status.textContent =
          "Form unavailable. Please contact the team directly.";
    };
    let created = false;
    if (src && !script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.telyNativeSdk = "";
      created = true;
    }
    script?.addEventListener("error", unavailable);
    if (!src || script?.dataset.telyFailed === "true") unavailable();
    if (created) document.head.appendChild(script!);
    return () => {
      form.removeEventListener("tely-cta:requested", acknowledged);
      script?.removeEventListener("error", unavailable);
    };
  }, [form, onRequested]);
  return { form, ref: setForm };
}
