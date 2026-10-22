// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import TelyWidgets from "./TelyWidgets";

it("keeps both owner embeds on public navigation and disposes them before private routes", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubEnv(
    "VITE_TELY_SALES_SCRIPT_TAG",
    '<script src="https://sales-receptionist.tely.health/widget.js" data-tely-key="owner-issued-key" async></script>'
  );
  vi.stubEnv(
    "VITE_TELY_ANALYTICS_SCRIPT_TAG",
    '<script src="https://analytics.tely.health/public/t.js" data-tely-key="analytics-owner-key" async></script>'
  );
  const location = memoryLocation({ path: "/portal" });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const embeds = () =>
    document.querySelectorAll<HTMLScriptElement>("script[data-tely-key]");
  try {
    await act(async () =>
      root.render(
        <Router hook={location.hook}>
          <TelyWidgets />
        </Router>
      )
    );
    expect(embeds().length).toBe(0);
    await act(async () => location.navigate("/"));
    expect(embeds().length).toBe(2);
    const first = embeds()[0];
    expect(first.src).toBe("https://sales-receptionist.tely.health/widget.js");
    expect(first.dataset.telyKey).toBe("owner-issued-key");
    const analytics = embeds()[1];
    expect(analytics.src).toBe("https://analytics.tely.health/public/t.js");
    expect(analytics.dataset.telyKey).toBe("analytics-owner-key");
    expect(analytics.dataset.telyExcludePaths).toBe("/portal,/admin");
    let disposals = 0;
    const trackDisposal = (script: HTMLScriptElement, event: string) =>
      script.addEventListener(event, () => {
        expect(
          script.isConnected,
          "owner must receive cleanup before script removal"
        ).toBe(true);
        disposals++;
      });
    trackDisposal(first, "tely-sales:dispose");
    trackDisposal(analytics, "tely-analytics:dispose");
    await act(async () => location.navigate("/blog/example"));
    expect(embeds()[0]).toBe(first);
    expect(disposals).toBe(0);
    await act(async () => location.navigate("/portal"));
    expect(disposals).toBe(2);
    expect(embeds().length).toBe(0);
    expect(first.isConnected).toBe(false);
    await act(async () => location.navigate("/services/bookkeeping"));
    expect(embeds().length).toBe(2);
    expect(embeds()[0]).not.toBe(first);
    trackDisposal(embeds()[0], "tely-sales:dispose");
    trackDisposal(embeds()[1], "tely-analytics:dispose");
    await act(async () => location.navigate("/admin/responses"));
    expect(disposals).toBe(4);
    expect(embeds().length).toBe(0);
    await act(async () => location.navigate("/admin/portal"));
    expect(embeds().length).toBe(0);
    expect(disposals).toBe(4);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllEnvs();
  }
});
