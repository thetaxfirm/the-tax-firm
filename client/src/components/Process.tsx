import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Search, FileText, Cog, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Discovery Call",
    description:
      "We start with a free, no-obligation consultation to understand your current tax situation, business structure, and financial goals.",
  },
  {
    icon: FileText,
    number: "02",
    title: "Comprehensive Analysis",
    description:
      "Our team performs a deep dive into your tax returns, business entities, income streams, and financial picture to identify every opportunity.",
  },
  {
    icon: Cog,
    number: "03",
    title: "Custom Strategy",
    description:
      "We build a tailored tax plan covering entity restructuring, deduction optimization, asset protection, and wealth-building strategies.",
  },
  {
    icon: BarChart3,
    number: "04",
    title: "Ongoing Optimization",
    description:
      "Tax planning isn't a one-time event. We provide year-round guidance, quarterly reviews, and proactive adjustments as laws and your situation evolve.",
  },
];

export default function Process() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="process" className="relative py-24 sm:py-32 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 section-ivory" />

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
              How It Works
            </span>
            <div className="h-px w-12 bg-[#D4A853]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#0B1120] leading-tight mb-4">
            Your Path to Tax Freedom
          </h2>
          <p className="text-lg text-[#0B1120]/60 max-w-2xl mx-auto">
            A proven, systematic approach to reducing your tax burden and building lasting wealth.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
              className="relative group"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+2rem)] right-[-2rem] h-px bg-[#D4A853]/20" />
              )}

              <div className="text-center">
                {/* Number */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-[#0B1120] border border-[#D4A853]/20 flex items-center justify-center group-hover:border-[#D4A853]/50 transition-all duration-500">
                    <step.icon size={28} className="text-[#D4A853]" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#D4A853] text-[#0B1120] text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-serif text-xl text-[#0B1120] mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#0B1120]/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="text-center mt-16"
        >
          <a
            href="https://calendly.com/chriscraig702"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#0B1120] text-[#D4A853] font-semibold text-base rounded-sm hover:bg-[#0F1729] transition-all duration-300 shadow-lg shadow-[#0B1120]/20"
          >
            Start Your Free Discovery Call
          </a>
        </motion.div>
      </div>
    </section>
  );
}
