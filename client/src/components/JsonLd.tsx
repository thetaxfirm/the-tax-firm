import { useEffect, useId } from "react";

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Injects JSON-LD structured data into <head> for SEO.
 * Cleans up on unmount to avoid duplicates in SPA navigation.
 */
export default function JsonLd({ data }: JsonLdProps) {
  const id = useId();

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = `jsonld-${id}`;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [data, id]);

  return null;
}
