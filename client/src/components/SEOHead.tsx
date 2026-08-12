import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
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
  keywords,
  image = "/og-default.jpg",
  url,
  type = "website",
  author,
  publishedTime,
}: SEOHeadProps) {
  useEffect(() => {
    const siteName = "The Tax Firm";
    const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
    const canonicalUrl = url || `https://thetaxfirm.us${window.location.pathname}`;

    // Update document title
    document.title = fullTitle;

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

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
    if (keywords) setMeta("keywords", keywords, true);

    // Open Graph
    setMeta("og:title", fullTitle);
    setMeta("og:description", description);
    setMeta("og:image", image);
    setMeta("og:url", canonicalUrl);
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

    // Cleanup on unmount
    return () => {
      document.title = "Tax Strategy & Planning for Business Owners | The Tax Firm";
      const link = document.querySelector('link[rel="canonical"]');
      if (link) link.remove();
    };
  }, [title, description, keywords, image, url, type, author, publishedTime]);

  return null;
}
