import { motion } from "framer-motion";
import { ArrowRight, Shield, TrendingUp, Landmark } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030437321/Y32hsJjLXpzLmBqnXDKJc5/hero-bg-m4FAsiLDeZrMUZXYYHAsDS.webp";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={HERO_BG}
          alt="Luxury boardroom"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/95 via-[#0B1120]/80 to-[#0B1120]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-[#0B1120]/40" />
      </div>

      {/* Subtle animated gradient accent */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#D4A853]/5 rounded-full blur-[120px] animate-pulse" />

      <div className="relative container pt-32 pb-20">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-px w-12 bg-[#D4A853]" />
            <span className="text-[#D4A853] text-xs uppercase tracking-[0.3em] font-medium">
              Advanced Tax Strategy & Planning
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6"
          >
            Stop Overpaying{" "}
            <span className="text-[#D4A853]">the IRS.</span>
            <br />
            Start Building{" "}
            <span className="text-[#D4A853]">Wealth.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl text-[#E8E4DD]/70 leading-relaxed mb-10 max-w-2xl"
          >
            We help small business owners and high-income earners dramatically reduce their tax burden through proactive tax planning, asset protection, and wealth-building strategies.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <a
              href="https://www.thetaxfirm.us"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#D4A853] text-[#0B1120] font-semibold text-base rounded-sm hover:bg-[#F0D68A] transition-all duration-300"
            >
              Schedule a Free Discovery Call
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-[#D4A853]/30 text-[#D4A853] font-medium text-base rounded-sm hover:bg-[#D4A853]/10 hover:border-[#D4A853]/50 transition-all duration-300"
            >
              Explore Our Services
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="grid grid-cols-3 gap-6 sm:gap-10 max-w-lg"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <Shield size={16} className="text-[#D4A853]" />
                <span className="font-serif text-2xl sm:text-3xl text-white">
                  <AnimatedCounter end={328} suffix="+" />
                </span>
              </div>
              <span className="text-xs sm:text-sm text-[#E8E4DD]/50 tracking-wide">Clients Served</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={16} className="text-[#D4A853]" />
                <span className="font-serif text-2xl sm:text-3xl text-white">
                  <AnimatedCounter end={26} suffix="%" />
                </span>
              </div>
              <span className="text-xs sm:text-sm text-[#E8E4DD]/50 tracking-wide">Avg. Tax Savings</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <Landmark size={16} className="text-[#D4A853]" />
                <span className="font-serif text-2xl sm:text-3xl text-white">
                  <AnimatedCounter end={6} suffix="+" />
                </span>
              </div>
              <span className="text-xs sm:text-sm text-[#E8E4DD]/50 tracking-wide">Years Experience</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B1120] to-transparent" />
    </section>
  );
}
