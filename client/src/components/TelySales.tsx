import { useLayoutEffect } from "react";
import { useLocation } from "wouter";

export default function TelySales() {
  const [location] = useLocation();
  const publicPage = !/^\/(?:portal|admin)(?:\/|$)/.test(location);
  useLayoutEffect(() => {
    const tag = import.meta.env.VITE_TELY_SALES_SCRIPT_TAG;
    if (!publicPage || !tag) return;
    // Portal supplies the complete public tag; never assemble a tenant key.
    const template = document.createElement("template");
    template.innerHTML = tag;
    const supplied = template.content.querySelector(
      "script[src][data-tely-key]"
    );
    if (!supplied) return;
    const script = document.createElement("script");
    for (const attribute of Array.from(supplied.attributes))
      script.setAttribute(attribute.name, attribute.value);
    script.async = true;
    document.head.appendChild(script);
    return () => {
      script.dispatchEvent(new Event("tely-sales:dispose"));
      script.remove();
    };
  }, [publicPage]);
  return null;
}
