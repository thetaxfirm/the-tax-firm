import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const comparisons = [
  {
    traditional: "Files your taxes after the year ends",
    taxFirm: "Plans your taxes proactively throughout the year",
  },
  {
    traditional: "Focuses only on compliance",
    taxFirm: "Focuses on strategy, savings, and wealth building",
  },
  {
    traditional: "One-size-fits-all approach",
    taxFirm: "Custom plan for your business and income",
  },
  {
    traditional: "\"That's just the way it is\"",
    taxFirm: "\"Here's how we can fix that\"",
  },
  {
    traditional: "Reactive — waits for problems",
    taxFirm: "Proactive — prevents problems before they happen",
  },
  {
    traditional: "Limited to basic deductions",
    taxFirm: "Advanced strategies across 75,000+ pages of tax code",
  },
];

export default function WhyUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-32 section-dark overflow-hidden" ref={ref}>
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#D4A853]/3 rounded-full blur-[200px]" />

      <div className="relative container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#D4A853]" />
            <span className="text-[#D4A853] text-xs uppercase tracking-[0.3em] font-medium">
              The Difference
            </span>
            <div className="h-px w-12 bg-[#D4A853]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-4">
            Traditional CPA vs. The Tax Firm
          </h2>
          <p className="text-lg text-[#E8E4DD]/60 max-w-2xl mx-auto">
            See why business owners and high-income earners are switching from traditional tax preparers to strategic tax planning.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <span className="text-sm text-[#E8E4DD]/40 uppercase tracking-wider font-medium">
                Traditional CPA
              </span>
            </div>
            <div className="text-center">
              <span className="text-sm text-[#D4A853] uppercase tracking-wider font-medium">
                The Tax Firm
              </span>
            </div>
          </div>

          {/* Comparison rows */}
          <div className="space-y-3">
            {comparisons.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="glass-card rounded-sm p-4 flex items-start gap-3 border-red-500/10">
                  <XCircle size={18} className="text-red-400/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-[#E8E4DD]/50">{item.traditional}</span>
                </div>
                <div className="glass-card rounded-sm p-4 flex items-start gap-3 border-[#D4A853]/20 bg-[#D4A853]/5">
                  <CheckCircle2 size={18} className="text-[#D4A853] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#E8E4DD]/80">{item.taxFirm}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
