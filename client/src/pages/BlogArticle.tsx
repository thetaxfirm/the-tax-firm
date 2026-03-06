/*
 * Individual blog article page for The Tax Firm.
 * Design: Midnight Boardroom dark luxury aesthetic with gold accents.
 * Features: Markdown rendering, related articles, CTA, share links.
 */
import React, { useMemo } from "react";
import { Link, useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  ArrowRight,
  Share2,
  BookOpen,
} from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import { useQuestionnaire } from "@/contexts/QuestionnaireContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* Simple markdown-to-JSX renderer for article content */
function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactElement[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const Tag = listType;
      elements.push(
        <Tag
          key={`list-${elements.length}`}
          className={`${
            listType === "ol" ? "list-decimal" : "list-disc"
          } pl-6 space-y-2 text-[#E8E4DD]/60 leading-relaxed mb-6`}
        >
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          ))}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  };

  const inlineFormat = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#E8E4DD]/90 font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-2xl md:text-3xl font-serif text-white mt-12 mb-5"
        >
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-xl font-serif text-[#D4A853] mt-8 mb-4"
        >
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.match(/^[-*] /)) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listItems.push(line.replace(/^[-*] /, ""));
    } else if (line.match(/^\d+\. /)) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listItems.push(line.replace(/^\d+\. /, ""));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      elements.push(
        <p
          key={`p-${i}`}
          className="text-[#E8E4DD]/60 leading-relaxed mb-5"
          dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
        />
      );
    }
  }
  flushList();
  return elements;
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { openQuestionnaire } = useQuestionnaire();

  const post = useMemo(
    () => blogPosts.find((p) => p.slug === slug),
    [slug]
  );

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return blogPosts
      .filter((p) => p.slug !== post.slug)
      .filter(
        (p) =>
          p.category === post.category ||
          p.title.split(" ").some((word) =>
            post.title.toLowerCase().includes(word.toLowerCase())
          )
      )
      .slice(0, 3);
  }, [post, slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <BookOpen size={48} className="mx-auto text-[#D4A853]/30 mb-4" />
            <h1 className="text-2xl font-serif text-white mb-3">
              Article Not Found
            </h1>
            <p className="text-[#E8E4DD]/40 mb-6">
              The article you're looking for doesn't exist.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <Navbar />

      {/* Article Header */}
      <section className="pt-32 pb-8 relative">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgba(212,168,83,0.15) 0%, transparent 50%)",
            }}
          />
        </div>

        <div className="container relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link
              href="/"
              className="text-[#E8E4DD]/40 hover:text-[#D4A853] transition-colors"
            >
              Home
            </Link>
            <span className="text-[#E8E4DD]/20">/</span>
            <Link
              href="/blog"
              className="text-[#E8E4DD]/40 hover:text-[#D4A853] transition-colors"
            >
              Blog
            </Link>
            <span className="text-[#E8E4DD]/20">/</span>
            <span className="text-[#D4A853]/70 truncate max-w-[200px]">
              {post.title}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="px-3 py-1 bg-[#D4A853]/15 text-[#D4A853] text-xs font-semibold uppercase tracking-wider rounded-sm border border-[#D4A853]/20">
                {post.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#E8E4DD]/40">
                <Clock size={12} />
                {post.readTime}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white leading-tight mb-6">
              {post.title}
            </h1>

            <p className="text-lg text-[#E8E4DD]/50 leading-relaxed mb-8">
              {post.excerpt}
            </p>

            {/* Author & Meta */}
            <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-[#D4A853]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4A853]/15 border border-[#D4A853]/30 flex items-center justify-center">
                  <User size={16} className="text-[#D4A853]" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">
                    {post.author}
                  </p>
                  <p className="text-xs text-[#E8E4DD]/40">{post.authorRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#E8E4DD]/40">
                <Calendar size={12} />
                {post.date}
              </div>
              <button
                onClick={handleShare}
                className="ml-auto flex items-center gap-2 text-xs text-[#E8E4DD]/40 hover:text-[#D4A853] transition-colors"
              >
                <Share2 size={14} />
                Share
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="pb-8">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl rounded-sm overflow-hidden border border-[#D4A853]/10"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 md:h-80 object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="pb-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-3xl"
          >
            {renderMarkdown(post.content)}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-y border-[#D4A853]/10">
        <div className="container">
          <div className="max-w-3xl">
            <div className="glass-card rounded-sm p-8 md:p-10 text-center">
              <h3 className="text-2xl md:text-3xl font-serif text-white mb-4">
                Ready to Reduce Your Tax Burden?
              </h3>
              <p className="text-[#E8E4DD]/50 mb-8 max-w-lg mx-auto">
                Schedule a free discovery call and learn how these strategies
                can be tailored to your specific financial situation.
              </p>
              <button
                onClick={openQuestionnaire}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-all duration-300"
              >
                Schedule a Free Discovery Call
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="max-w-5xl">
              <h3 className="text-2xl font-serif text-white mb-8">
                Related Articles
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((related, i) => (
                  <motion.div
                    key={related.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <Link href={`/blog/${related.slug}`}>
                      <article className="group h-full flex flex-col bg-[#0F1729] border border-[#D4A853]/10 rounded-sm overflow-hidden hover:border-[#D4A853]/25 transition-all duration-500">
                        <div className="relative h-36 overflow-hidden">
                          <img
                            src={related.image}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1729] via-transparent to-transparent" />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <span className="text-[10px] uppercase tracking-wider text-[#D4A853] mb-2">
                            {related.category}
                          </span>
                          <h4 className="text-sm font-serif text-white leading-snug group-hover:text-[#D4A853] transition-colors duration-300 flex-1">
                            {related.title}
                          </h4>
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#D4A853]/70 group-hover:text-[#D4A853] transition-colors">
                            Read
                            <ArrowRight size={10} />
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog */}
      <section className="pb-20">
        <div className="container">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[#D4A853]/70 hover:text-[#D4A853] transition-colors group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to All Articles
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
