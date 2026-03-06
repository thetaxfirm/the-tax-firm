import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { AlertTriangle, Ban, TrendingDown } from "lucide-react";

const painPoints = [
  {
    icon: AlertTriangle,
    title: "Your CPA says \"That's just the way it is\"",
    description:
      "Most CPAs are trained to file taxes, not plan them. They report what happened last year — they don't strategize for next year.",
  },
  {
    icon: Ban,
    title: "You have no proactive tax plan",
    description:
      "Without a forward-looking strategy, you're leaving tens of thousands — or more — on the table every single year.",
  },
  {
    icon: TrendingDown,
    title: "You're paying more than you should",
    description:
      "If you're a business owner or high-income earner without a dedicated tax strategist, you're almost certainly overpaying the IRS.",
  },
];

export default function PainPoints() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" ref={ref}>
      {/* Ivory background section */}
      <div className="absolute inset-0 section-ivory" />

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
              The Problem
            </span>
            <div className="h-px w-12 bg-[#D4A853]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#0B1120] leading-tight mb-4">
            Tired of Paying the IRS <br className="hidden sm:block" />
            All Your Money?
          </h2>
          <p className="text-lg text-[#0B1120]/60 max-w-2xl mx-auto">
            If you don't have a tax plan, you're overpaying on your taxes. It's time to get serious and solve your tax problems — once and for all.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {painPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
              className="relative group"
            >
              <div className="bg-white rounded-sm p-8 shadow-lg shadow-black/5 border border-[#0B1120]/5 hover:shadow-xl hover:shadow-[#D4A853]/5 transition-all duration-500 h-full">
                <div className="w-12 h-12 rounded-sm bg-[#0B1120] flex items-center justify-center mb-6">
                  <point.icon size={22} className="text-[#D4A853]" />
                </div>
                <h3 className="font-serif text-xl text-[#0B1120] mb-3 leading-snug">
                  {point.title}
                </h3>
                <p className="text-[#0B1120]/60 leading-relaxed text-sm">
                  {point.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
