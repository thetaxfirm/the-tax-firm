/*
 * Blog preview section for the homepage.
 * Shows the 3 most recent articles with a link to the full blog.
 * Design: Midnight Boardroom dark luxury aesthetic.
 */
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { blogPosts, type BlogPost } from "@/data/blogPosts";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export default function BlogPreview() {
  const { data: dynamicData } = trpc.blog.published.useQuery(
    { limit: 12 },
    { staleTime: 60_000 }
  );

  const previewPosts = useMemo(() => {
    const rawItems = Array.isArray(dynamicData) ? dynamicData : (dynamicData?.items || []);
    const dbPosts: BlogPost[] = rawItems.map((a: any) => ({
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
    const staticSlugs = new Set(blogPosts.map((p) => p.slug));
    const uniqueDbPosts = dbPosts.filter((p) => !staticSlugs.has(p.slug));
    return [...blogPosts, ...uniqueDbPosts].slice(0, 3);
  }, [dynamicData]);

  return (
    <section className="py-24 section-dark" id="resources">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-[#D4A853]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#D4A853]">
                Resources & Insights
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-white">
              Tax Strategy{" "}
              <span className="gold-gradient-text">Insights</span>
            </h2>
            <p className="mt-3 text-[#E8E4DD]/45 max-w-lg">
              Expert articles to help you understand the strategies that can
              reduce your tax burden and build lasting wealth.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#D4A853]/30 text-[#D4A853] text-sm font-medium rounded-sm hover:bg-[#D4A853]/10 transition-all duration-300 group whitespace-nowrap"
          >
            View All Articles
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {previewPosts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <article className="group h-full flex flex-col bg-[#0F1729] border border-[#D4A853]/10 rounded-sm overflow-hidden hover:border-[#D4A853]/25 transition-all duration-500 hover:shadow-lg hover:shadow-[#D4A853]/5">
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
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
                    <p className="text-sm text-[#E8E4DD]/40 leading-relaxed flex-1 line-clamp-3">
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
        </div>
      </div>
    </section>
  );
}
