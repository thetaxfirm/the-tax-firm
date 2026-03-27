/*
 * Blog/Resources listing page for The Tax Firm.
 * Design: Midnight Boardroom dark luxury aesthetic with gold accents.
 * Features: Category filtering, featured article hero, grid layout, search.
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, Search, ArrowLeft, BookOpen } from "lucide-react";
import { blogPosts, categories, type BlogPost } from "@/data/blogPosts";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch dynamic articles from database
  const { data: dynamicArticles } = trpc.blog.published.useQuery(undefined, {
    staleTime: 60_000,
  });

  // Merge static and dynamic articles, sorted by date (newest first)
  const allPosts = useMemo(() => {
    const dbPosts: BlogPost[] = (dynamicArticles || []).map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      category: a.category,
      readTime: a.readTime,
      date: new Date(a.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      author: a.author,
      authorRole: a.authorRole,
      featured: a.featured,
      image: a.image,
      content: a.content,
    }));
    // Merge, avoiding duplicate slugs (static takes precedence)
    const staticSlugs = new Set(blogPosts.map((p) => p.slug));
    const uniqueDbPosts = dbPosts.filter((p) => !staticSlugs.has(p.slug));
    return [...blogPosts, ...uniqueDbPosts];
  }, [dynamicArticles]);

  // Merge dynamic categories
  const allCategories = useMemo(() => {
    const dynamicCats = (dynamicArticles || [])
      .map((a) => a.category)
      .filter((c) => !categories.includes(c));
    const uniqueCats = Array.from(new Set(dynamicCats));
    return [...categories, ...uniqueCats];
  }, [dynamicArticles]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, allPosts]);

  const featuredPost = allPosts.find((p) => p.featured);

  const regularPosts = filteredPosts.filter((p) => !p.featured || activeCategory !== "All" || searchQuery !== "");

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <SEOHead
        title="Blog & Resources"
        description="Expert tax strategy insights, tips, and guides from The Tax Firm. Learn about S-Corp elections, Roth conversions, real estate tax strategies, asset protection, and more."
      />
      <Navbar />

      {/* Hero Header */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(212,168,83,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212,168,83,0.1) 0%, transparent 40%)",
            }}
          />
        </div>

        <div className="container relative">
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#D4A853]/70 hover:text-[#D4A853] transition-colors mb-8 group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-10 bg-[#D4A853]" />
                <span className="text-xs uppercase tracking-[0.3em] text-[#D4A853]">
                  Resources & Insights
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight">
                Tax Strategy{" "}
                <span className="gold-gradient-text">Insights</span>
              </h1>
              <p className="mt-4 text-lg text-[#E8E4DD]/50 max-w-xl">
                Expert articles on tax planning, entity structuring, wealth
                building, and asset protection for business owners and
                high-income earners.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E8E4DD]/30"
              />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0F1729] border border-[#D4A853]/15 rounded-sm text-[#E8E4DD] placeholder-[#E8E4DD]/30 focus:outline-none focus:border-[#D4A853]/40 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm rounded-sm transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-[#D4A853] text-[#0B1120] font-semibold"
                    : "bg-[#0F1729] text-[#E8E4DD]/50 border border-[#D4A853]/10 hover:border-[#D4A853]/30 hover:text-[#E8E4DD]/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {activeCategory === "All" && searchQuery === "" && featuredPost && (
        <section className="pb-16">
          <div className="container">
            <Link href={`/blog/${featuredPost.slug}`}>
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="group relative grid lg:grid-cols-2 gap-0 rounded-sm overflow-hidden border border-[#D4A853]/15 hover:border-[#D4A853]/30 transition-all duration-500"
              >
                {/* Image */}
                <div className="relative h-64 lg:h-auto overflow-hidden">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-[#D4A853] text-[#0B1120] text-xs font-bold uppercase tracking-wider rounded-sm">
                      Featured
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 bg-[#0F1729] flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs uppercase tracking-wider text-[#D4A853]">
                      {featuredPost.category}
                    </span>
                    <span className="text-[#E8E4DD]/20">|</span>
                    <span className="flex items-center gap-1.5 text-xs text-[#E8E4DD]/40">
                      <Clock size={12} />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-serif text-white mb-4 group-hover:text-[#D4A853] transition-colors duration-300">
                    {featuredPost.title}
                  </h2>
                  <p className="text-[#E8E4DD]/50 leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#E8E4DD]/30">
                      {featuredPost.date}
                    </span>
                    <span className="flex items-center gap-2 text-sm text-[#D4A853] font-medium group-hover:gap-3 transition-all duration-300">
                      Read Article
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.article>
            </Link>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="pb-24">
        <div className="container">
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen size={48} className="mx-auto text-[#D4A853]/30 mb-4" />
              <h3 className="text-xl font-serif text-white mb-2">
                No articles found
              </h3>
              <p className="text-[#E8E4DD]/40">
                Try adjusting your search or filter criteria.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {regularPosts.map((post, i) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <article className="group h-full flex flex-col bg-[#0F1729] border border-[#D4A853]/10 rounded-sm overflow-hidden hover:border-[#D4A853]/25 transition-all duration-500 hover:shadow-lg hover:shadow-[#D4A853]/5">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1729] via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 bg-[#0B1120]/80 backdrop-blur-sm text-[#D4A853] text-[10px] font-semibold uppercase tracking-wider rounded-sm border border-[#D4A853]/20">
                              {post.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="flex items-center gap-1.5 text-xs text-[#E8E4DD]/35">
                              <Clock size={11} />
                              {post.readTime}
                            </span>
                            <span className="text-[#E8E4DD]/15">|</span>
                            <span className="text-xs text-[#E8E4DD]/35">
                              {post.date}
                            </span>
                          </div>
                          <h3 className="text-lg font-serif text-white mb-3 leading-snug group-hover:text-[#D4A853] transition-colors duration-300">
                            {post.title}
                          </h3>
                          <p className="text-sm text-[#E8E4DD]/40 leading-relaxed flex-1">
                            {post.excerpt}
                          </p>
                          <div className="mt-5 pt-4 border-t border-[#D4A853]/8 flex items-center justify-between">
                            <span className="text-xs text-[#E8E4DD]/30">
                              By {post.author}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-[#D4A853] font-medium group-hover:gap-2.5 transition-all duration-300">
                              Read
                              <ArrowRight size={12} />
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
