// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import TelySales from "./TelySales";

it("keeps one owner embed on public navigation and disposes it before private routes", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubEnv(
    "VITE_TELY_SALES_SCRIPT_TAG",
    '<script src="https://sales-receptionist.tely.health/widget.js" data-tely-key="owner-issued-key" async></script>'
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
          <TelySales />
        </Router>
      )
    );
    expect(embeds().length).toBe(0);
    await act(async () => location.navigate("/"));
    expect(embeds().length).toBe(1);
    const first = embeds()[0];
    expect(first.src).toBe("https://sales-receptionist.tely.health/widget.js");
    expect(first.dataset.telyKey).toBe("owner-issued-key");
    let disposals = 0;
    const trackDisposal = (script: HTMLScriptElement) =>
      script.addEventListener("tely-sales:dispose", () => {
        expect(
          script.isConnected,
          "owner must receive cleanup before script removal"
        ).toBe(true);
        disposals++;
      });
    trackDisposal(first);
    await act(async () => location.navigate("/blog/example"));
    expect(embeds()[0]).toBe(first);
    expect(disposals).toBe(0);
    await act(async () => location.navigate("/portal"));
    expect(disposals).toBe(1);
    expect(embeds().length).toBe(0);
    expect(first.isConnected).toBe(false);
    await act(async () => location.navigate("/services/bookkeeping"));
    expect(embeds().length).toBe(1);
    expect(embeds()[0]).not.toBe(first);
    trackDisposal(embeds()[0]);
    await act(async () => location.navigate("/admin/responses"));
    expect(disposals).toBe(2);
    expect(embeds().length).toBe(0);
    await act(async () => location.navigate("/admin/portal"));
    expect(embeds().length).toBe(0);
    expect(disposals).toBe(2);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllEnvs();
  }
});
