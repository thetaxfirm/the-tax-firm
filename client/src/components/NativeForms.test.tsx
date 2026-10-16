// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Questionnaire from "./Questionnaire";
import Contact from "./Contact";
import { QuestionnaireProvider } from "@/contexts/QuestionnaireContext";

vi.mock("framer-motion", () => ({
  useInView: () => true,
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      for (const key of [
        "initial",
        "animate",
        "exit",
        "transition",
        "variants",
        "custom",
      ])
        delete props[key];
      return <div {...props}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
}));

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubEnv(
    "VITE_TELY_EMBED_SCRIPT_URL",
    "https://cta.tely.health/embed.js?v=test"
  );
  vi.stubEnv(
    "VITE_TELY_QUESTIONNAIRE_CONTEXT_URL",
    "https://portal.tely.health/api/public/ctas/test"
  );
  vi.stubEnv(
    "VITE_TELY_QUESTIONNAIRE_SUBMISSIONS_URL",
    "https://portal.tely.health/api/public/ctas/test/submissions"
  );
  const sdk = document.createElement("script");
  sdk.dataset.telyNativeSdk = "";
  document.head.append(sdk);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
it("records an email-only updates request only after native acknowledgement, not a fake subscription", async () => {
  vi.stubEnv(
    "VITE_TELY_NEWSLETTER_CONTEXT_URL",
    "https://portal.tely.health/api/public/ctas/updates"
  );
  vi.stubEnv(
    "VITE_TELY_NEWSLETTER_SUBMISSIONS_URL",
    "https://portal.tely.health/api/public/ctas/updates/submissions"
  );
  await act(async () =>
    root.render(
      <QuestionnaireProvider>
        <Contact />
      </QuestionnaireProvider>
    )
  );
  const form = host.querySelector('form[data-tely-cta="native"]')!;
  (
    form.querySelector("fieldset[data-tely-pending]") as HTMLFieldSetElement
  ).disabled = false;
  await input("jane@example.org");
  await act(async () =>
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
  );
  expect(host.textContent).not.toContain("Request received");
  await act(async () =>
    form.dispatchEvent(new CustomEvent("tely-cta:requested", { bubbles: true }))
  );
  expect(host.textContent).toContain("Request received");
  expect(
    (form.querySelector('input[data-tely-field="email"]') as HTMLInputElement)
      .value
  ).toBe("jane@example.org");
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  document
    .querySelectorAll("script[data-tely-native-sdk]")
    .forEach(node => node.remove());
  vi.unstubAllEnvs();
});
it("keeps both forms unavailable with visible feedback when their shared SDK fails", async () => {
  await act(async () =>
    root.render(
      <QuestionnaireProvider>
        <Contact />
        <Questionnaire isOpen onClose={() => {}} />
      </QuestionnaireProvider>
    )
  );
  await act(async () =>
    document
      .querySelector("script[data-tely-native-sdk]")!
      .dispatchEvent(new Event("error"))
  );
  const statuses = host.querySelectorAll("[data-tely-status]");
  expect(statuses.length).toBe(2);
  for (const status of Array.from(statuses))
    expect(status.textContent).toContain("Form unavailable");
  for (const fieldset of Array.from(
    host.querySelectorAll<HTMLFieldSetElement>("fieldset[data-tely-pending]")
  ))
    expect(fieldset.disabled).toBe(true);
  expect(host.textContent).not.toContain("Pick a time below");
});
async function click(label: string) {
  const button = Array.from(host.querySelectorAll("button")).find(
    node => node.textContent?.trim() === label
  );
  expect(button, label).toBeTruthy();
  await act(async () => button!.click());
}
async function input(value: string) {
  const node = host.querySelector(
    "input:not([type=hidden]):not([hidden]),textarea"
  ) as HTMLInputElement | HTMLTextAreaElement;
  expect(node).toBeTruthy();
  const prototype =
    node.tagName === "TEXTAREA"
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(node, value);
    node.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
it("retains every answer and opens booking only after the native capture acknowledgement", async () => {
  await act(async () =>
    root.render(<Questionnaire isOpen onClose={() => {}} />)
  );
  const form = host.querySelector('form[data-tely-cta="native"]');
  expect(
    form,
    "questionnaire must use the shared native capture boundary"
  ).not.toBeNull();
  // SDK activation is a dependency boundary; its physical HTTP/replay behavior
  // is proved in Tely's native_form_runtime fixture, not duplicated here.
  (
    form!.querySelector("fieldset[data-tely-pending]") as HTMLFieldSetElement
  ).disabled = false;
  for (const value of ["Jane Smith", "jane@example.org", "(702) 555-0123"]) {
    await input(value);
    await click("Next");
  }
  await click("No");
  await click("Next");
  await click("Yes");
  await click("Next");
  await input("250000");
  await click("Next");
  await click("No");
  await click("Next");
  await click("Yes");
  await click("Next");
  await input("500000");
  await click("Next");
  await input("Plan retirement and tax strategy");
  const answers = Object.fromEntries(
    Array.from(
      form!.querySelectorAll<HTMLInputElement>("input[data-tely-field]")
    ).map(node => [node.dataset.telyField, node.value])
  );
  expect(answers).toMatchObject({
    name: "Jane Smith",
    email: "jane@example.org",
    phone: "(702) 555-0123",
    selfEmployed: "No",
    w2Employee: "Yes",
    annualIncome: "250,000",
    ownsRealEstate: "No",
    rothConversionInterest: "Yes",
    retirementSavings: "500,000",
    expectations: "Plan retirement and tax strategy",
  });
  await click("Complete");
  expect(host.textContent).not.toContain("Pick a time below");
  await act(async () =>
    root.render(<Questionnaire isOpen={false} onClose={() => {}} />)
  );
  await act(async () =>
    root.render(<Questionnaire isOpen onClose={() => {}} />)
  );
  expect(host.querySelector('form[data-tely-cta="native"]')).toBe(form);
  expect(
    (form!.querySelector('[data-tely-field="email"]') as HTMLInputElement).value
  ).toBe("jane@example.org");
  await act(async () =>
    form!.dispatchEvent(new CustomEvent("tely-cta:error", { bubbles: true }))
  );
  expect(host.textContent).not.toContain("Pick a time below");
  await act(async () =>
    form!.dispatchEvent(
      new CustomEvent("tely-cta:requested", {
        bubbles: true,
        detail: { traceId: "trace-test" },
      })
    )
  );
  expect(host.textContent).toContain("Pick a time below");
});
