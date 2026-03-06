import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, TrendingUp, Landmark, ArrowRight } from "lucide-react";

const ASSET_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030437321/Y32hsJjLXpzLmBqnXDKJc5/asset-protection-WqxTARzANJmhGLNfmhTFbQ.webp";
const TAX_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030437321/Y32hsJjLXpzLmBqnXDKJc5/tax-strategy-5a3XruTc83nMgNePitc6yY.webp";
const WEALTH_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030437321/Y32hsJjLXpzLmBqnXDKJc5/wealth-building-5JD6efQW29Da9vV6WVyUGn.webp";

const services = [
  {
    icon: Shield,
    title: "Asset Protection",
    subtitle: "Shield What You've Built",
    description:
      "We structure your business and personal holdings to protect your assets from lawsuits, creditors, and unnecessary exposure. Your wealth deserves a fortress — we build it.",
    features: [
      "Entity structuring & optimization",
      "Liability protection strategies",
      "Trust & estate planning integration",
      "Risk mitigation frameworks",
    ],
    image: ASSET_IMG,
  },
  {
    icon: TrendingUp,
    title: "Tax Mitigation",
    subtitle: "Keep More of What You Earn",
    description:
      "Our advanced tax strategies go far beyond what traditional CPAs offer. We analyze your entire financial picture and implement legal strategies to dramatically reduce your tax burden.",
    features: [
      "Proactive tax planning & strategy",
      "Business deduction optimization",
      "Retirement contribution strategies",
      "Multi-entity tax coordination",
    ],
    image: TAX_IMG,
  },
  {
    icon: Landmark,
    title: "Wealth Building",
    subtitle: "Grow Generational Wealth",
    description:
      "Tax savings are just the beginning. We help you reinvest those savings into wealth-building vehicles that compound over time, creating lasting financial freedom for you and your family.",
    features: [
      "Investment tax optimization",
      "Real estate tax strategies",
      "Retirement planning integration",
      "Generational wealth transfer",
    ],
    image: WEALTH_IMG,
  },
];

export default function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="relative py-24 sm:py-32 section-dark" ref={ref}>
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4A853]/3 rounded-full blur-[200px]" />

      <div className="relative container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#D4A853]" />
            <span className="text-[#D4A853] text-xs uppercase tracking-[0.3em] font-medium">
              Our Expertise
            </span>
            <div className="h-px w-12 bg-[#D4A853]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-4">
            We Aren't Just Tax Preparers
          </h2>
          <p className="text-lg text-[#E8E4DD]/60 max-w-2xl mx-auto">
            Anybody can prepare your taxes. We are Tax Planning Experts who go beyond the tax code to build a comprehensive strategy for your business, assets, and wealth.
          </p>
        </motion.div>

        <div className="space-y-20">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.2 }}
              className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                i % 2 === 1 ? "lg:direction-rtl" : ""
              }`}
            >
              {/* Image */}
              <div className={`relative ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="relative rounded-sm overflow-hidden glow-gold">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-72 sm:h-80 lg:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/60 to-transparent" />
                </div>
                {/* Decorative corner accent */}
                <div className="absolute -bottom-3 -right-3 w-24 h-24 border-b-2 border-r-2 border-[#D4A853]/30 rounded-br-sm" />
              </div>

              {/* Content */}
              <div className={`${i % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-sm bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center">
                    <service.icon size={20} className="text-[#D4A853]" />
                  </div>
                  <span className="text-[#D4A853] text-xs uppercase tracking-[0.2em] font-medium">
                    {service.subtitle}
                  </span>
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl text-white mb-4">
                  {service.title}
                </h3>

                <p className="text-[#E8E4DD]/60 leading-relaxed mb-8 text-base">
                  {service.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-[#E8E4DD]/70 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4A853]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="https://www.thetaxfirm.us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-[#D4A853] font-medium text-sm hover:text-[#F0D68A] transition-colors"
                >
                  Learn More
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
