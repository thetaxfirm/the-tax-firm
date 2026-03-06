import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Calculator, DollarSign, ArrowRight } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

export default function TaxCalculator() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [income, setIncome] = useState(300000);
  const [entityType, setEntityType] = useState("sole-prop");
  const [calculated, setCalculated] = useState(false);

  const calculateSavings = () => {
    setCalculated(true);
  };

  // Simplified savings estimate
  const getSavings = () => {
    const baseRate = entityType === "sole-prop" ? 0.35 : entityType === "s-corp" ? 0.28 : 0.25;
    const optimizedRate = entityType === "sole-prop" ? 0.22 : entityType === "s-corp" ? 0.18 : 0.16;
    const currentTax = income * baseRate;
    const optimizedTax = income * optimizedRate;
    return {
      currentTax: Math.round(currentTax),
      optimizedTax: Math.round(optimizedTax),
      savings: Math.round(currentTax - optimizedTax),
    };
  };

  const savings = getSavings();

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" ref={ref}>
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
              Tax Savings Estimator
            </span>
            <div className="h-px w-12 bg-[#D4A853]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#0B1120] leading-tight mb-4">
            How Much Could You Save?
          </h2>
          <p className="text-lg text-[#0B1120]/60 max-w-2xl mx-auto">
            Get a quick estimate of your potential tax savings with strategic tax planning.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-[#0B1120] rounded-sm p-8 sm:p-12 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Input Side */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <Calculator size={24} className="text-[#D4A853]" />
                  <h3 className="font-serif text-2xl text-white">Your Details</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-[#E8E4DD]/60 mb-2 uppercase tracking-wider">
                      Annual Income
                    </label>
                    <div className="relative">
                      <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A853]" />
                      <input
                        type="number"
                        value={income}
                        onChange={(e) => {
                          setIncome(Number(e.target.value));
                          setCalculated(false);
                        }}
                        className="w-full bg-[#0F1729] border border-[#D4A853]/20 rounded-sm pl-10 pr-4 py-3 text-white text-lg focus:border-[#D4A853]/50 focus:outline-none transition-colors"
                      />
                    </div>
                    <input
                      type="range"
                      min={50000}
                      max={2000000}
                      step={10000}
                      value={income}
                      onChange={(e) => {
                        setIncome(Number(e.target.value));
                        setCalculated(false);
                      }}
                      className="w-full mt-3 accent-[#D4A853]"
                    />
                    <div className="flex justify-between text-xs text-[#E8E4DD]/40 mt-1">
                      <span>$50K</span>
                      <span>$2M</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#E8E4DD]/60 mb-2 uppercase tracking-wider">
                      Current Business Structure
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "sole-prop", label: "Sole Prop" },
                        { value: "s-corp", label: "S-Corp" },
                        { value: "llc", label: "LLC" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setEntityType(option.value);
                            setCalculated(false);
                          }}
                          className={`py-2.5 rounded-sm text-sm font-medium transition-all duration-300 ${
                            entityType === option.value
                              ? "bg-[#D4A853] text-[#0B1120]"
                              : "bg-[#0F1729] text-[#E8E4DD]/60 border border-[#D4A853]/10 hover:border-[#D4A853]/30"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={calculateSavings}
                    className="w-full py-4 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Calculate My Savings
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* Results Side */}
              <div className="flex flex-col justify-center">
                {calculated ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="glass-card rounded-sm p-6">
                      <div className="text-sm text-[#E8E4DD]/50 uppercase tracking-wider mb-2">
                        Current Estimated Tax
                      </div>
                      <div className="font-serif text-3xl text-red-400">
                        ${savings.currentTax.toLocaleString()}
                      </div>
                    </div>

                    <div className="glass-card rounded-sm p-6">
                      <div className="text-sm text-[#E8E4DD]/50 uppercase tracking-wider mb-2">
                        Optimized Tax With Strategy
                      </div>
                      <div className="font-serif text-3xl text-emerald-400">
                        ${savings.optimizedTax.toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-[#D4A853]/10 border border-[#D4A853]/30 rounded-sm p-6">
                      <div className="text-sm text-[#D4A853] uppercase tracking-wider mb-2">
                        Estimated Annual Savings
                      </div>
                      <div className="font-serif text-4xl text-[#D4A853]">
                        ${savings.savings.toLocaleString()}
                      </div>
                    </div>

                    <p className="text-xs text-[#E8E4DD]/40 leading-relaxed">
                      * This is a simplified estimate for illustrative purposes only. Actual savings depend on your specific situation. Schedule a free discovery call for a personalized analysis.
                    </p>
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <Calculator size={48} className="text-[#D4A853]/20 mx-auto mb-4" />
                    <p className="text-[#E8E4DD]/40 text-lg">
                      Enter your details and click calculate to see your potential savings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
