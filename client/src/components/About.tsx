import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

const ABOUT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030437321/Y32hsJjLXpzLmBqnXDKJc5/about-section-fJd2xyarVD9oVw3sXr5f5M.webp";

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-24 sm:py-32 section-dark overflow-hidden" ref={ref}>
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4A853]/3 rounded-full blur-[200px]" />

      <div className="relative container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-sm overflow-hidden">
              <img
                src={ABOUT_IMG}
                alt="The Tax Firm office"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/40 to-transparent" />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-32 h-32 border-t-2 border-l-2 border-[#D4A853]/20 rounded-tl-sm" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-b-2 border-r-2 border-[#D4A853]/20 rounded-br-sm" />

            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -bottom-6 -right-6 sm:right-8 glass-card rounded-sm p-6 glow-gold"
            >
              <div className="font-serif text-3xl text-[#D4A853] mb-1">10+</div>
              <div className="text-xs text-[#E8E4DD]/60 uppercase tracking-wider">Years of Expertise</div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-[#D4A853]" />
              <span className="text-[#D4A853] text-xs uppercase tracking-[0.3em] font-medium">
                Meet Your Strategist
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-6">
              A Message From{" "}
              <span className="text-[#D4A853]">Christopher Craig</span>
            </h2>

            <div className="relative mb-8">
              <Quote size={32} className="text-[#D4A853]/20 mb-4" />
              <p className="font-quote italic text-lg text-[#E8E4DD]/80 leading-relaxed mb-6">
                I help small business owners and high-income employees reduce income taxes to build wealth and invest. My mission is to ensure that every client keeps more of what they earn and builds a legacy that lasts for generations.
              </p>
              <p className="text-[#E8E4DD]/60 leading-relaxed mb-6">
                At The Tax Firm, we pride ourselves on thinking and acting differently than traditional tax preparers. We don't just know the tax code — we look at your entire financial picture including your business, asset protection needs, and wealth-building goals to create a comprehensive plan tailored specifically to you.
              </p>
              <p className="text-[#E8E4DD]/60 leading-relaxed">
                When you work with us, you're not just getting a tax preparer. You're getting a strategic partner who is invested in your financial success. We believe that with the right strategy, every business owner and high-income earner can dramatically reduce their tax burden while building lasting wealth.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-[#D4A853]" />
              <div>
                <div className="text-white font-semibold">Christopher Craig</div>
                <div className="text-[#D4A853] text-sm">Enrolled Agent<br />Licensed to Practice before the IRS</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
