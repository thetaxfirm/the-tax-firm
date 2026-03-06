import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  author?: string;
  publishedTime?: string;
}

/**
 * SEOHead sets Open Graph, Twitter Card, and standard meta tags dynamically.
 * It updates <head> meta tags on mount and cleans up on unmount.
 */
export default function SEOHead({
  title,
  description,
  image = "https://manus.storage.googleapis.com/the-tax-firm-og-default.jpg",
  url,
  type = "website",
  author,
  publishedTime,
}: SEOHeadProps) {
  useEffect(() => {
    const siteName = "The Tax Firm";
    const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
    const currentUrl = url || window.location.href;

    // Update document title
    document.title = fullTitle;

    // Helper to set or create a meta tag
    const setMeta = (property: string, content: string, isName = false) => {
      const attr = isName ? "name" : "property";
      let tag = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // Standard meta
    setMeta("description", description, true);

    // Open Graph
    setMeta("og:title", fullTitle);
    setMeta("og:description", description);
    setMeta("og:image", image);
    setMeta("og:url", currentUrl);
    setMeta("og:type", type);
    setMeta("og:site_name", siteName);

    // Twitter Card
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", fullTitle, true);
    setMeta("twitter:description", description, true);
    setMeta("twitter:image", image, true);

    // Article-specific tags
    if (type === "article") {
      if (author) setMeta("article:author", author);
      if (publishedTime) setMeta("article:published_time", publishedTime);
    }

    // Cleanup: restore default title on unmount
    return () => {
      document.title = "The Tax Firm | Advanced Tax Strategy & Planning";
    };
  }, [title, description, image, url, type, author, publishedTime]);

  return null;
}
