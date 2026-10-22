import { useLayoutEffect } from "react";
import { useLocation } from "wouter";

export default function TelyWidgets() {
  const [location] = useLocation();
  const publicPage = !/^\/(?:portal|admin)(?:\/|$)/.test(location);
  useLayoutEffect(() => {
    if (!publicPage) return;
    const cleanups: Array<() => void> = [];
    for (const [tag, dispose, excludedPaths] of [
      [import.meta.env.VITE_TELY_SALES_SCRIPT_TAG, "tely-sales:dispose", ""],
      [
        import.meta.env.VITE_TELY_ANALYTICS_SCRIPT_TAG,
        "tely-analytics:dispose",
        "/portal,/admin",
      ],
    ]) {
      if (!tag) continue;
      // Portal supplies complete public tags; never assemble a tenant key.
      const template = document.createElement("template");
      template.innerHTML = tag;
      const supplied = template.content.querySelector(
        "script[src][data-tely-key]"
      );
      if (!supplied) continue;
      const script = document.createElement("script");
      for (const attribute of Array.from(supplied.attributes))
        script.setAttribute(attribute.name, attribute.value);
      if (excludedPaths)
        script.setAttribute("data-tely-exclude-paths", excludedPaths);
      script.async = true;
      document.head.appendChild(script);
      cleanups.push(() => {
        script.dispatchEvent(new Event(dispose));
        script.remove();
      });
    }
    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [publicPage]);
  return null;
}
