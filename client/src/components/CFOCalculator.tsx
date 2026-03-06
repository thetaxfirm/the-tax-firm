import { useState, useMemo } from "react";
import { Calculator, DollarSign, TrendingDown, TrendingUp, ArrowRight } from "lucide-react";
import { useQuestionnaire } from "@/contexts/QuestionnaireContext";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`;
};

export default function CFOCalculator() {
  const { openQuestionnaire } = useQuestionnaire();
  const [annualRevenue, setAnnualRevenue] = useState<string>("1000000");
  const [currentTaxRate, setCurrentTaxRate] = useState<string>("35");
  const [monthlyBookkeeping, setMonthlyBookkeeping] = useState<string>("2000");
  const [hasFullTimeCFO, setHasFullTimeCFO] = useState(false);
  const [fullTimeCFOSalary, setFullTimeCFOSalary] = useState<string>("250000");

  const results = useMemo(() => {
    const revenue = parseFloat(annualRevenue.replace(/,/g, "")) || 0;
    const taxRate = parseFloat(currentTaxRate) || 0;
    const bookkeeping = parseFloat(monthlyBookkeeping.replace(/,/g, "")) || 0;
    const cfoSalary = hasFullTimeCFO ? parseFloat(fullTimeCFOSalary.replace(/,/g, "")) || 0 : 0;

    // Current costs
    const currentTaxBurden = revenue * (taxRate / 100);
    const currentBookkeepingAnnual = bookkeeping * 12;
    const currentTotalCost = currentTaxBurden + currentBookkeepingAnnual + cfoSalary;

    // With Fractional CFO (conservative estimates)
    // Tax savings: 15-30% reduction in effective tax rate through strategic planning
    const taxSavingsRate = 0.25; // 25% average reduction
    const optimizedTaxBurden = currentTaxBurden * (1 - taxSavingsRate);
    const taxSavings = currentTaxBurden - optimizedTaxBurden;

    // Cash flow optimization: typically saves 5-10% of revenue through better management
    const cashFlowSavingsRate = 0.03; // 3% conservative
    const cashFlowSavings = revenue * cashFlowSavingsRate;

    // Fractional CFO cost (tiered by revenue)
    let fractionalCFOCost: number;
    if (revenue <= 500000) {
      fractionalCFOCost = 36000; // $3K/mo
    } else if (revenue <= 1000000) {
      fractionalCFOCost = 54000; // $4.5K/mo
    } else if (revenue <= 3000000) {
      fractionalCFOCost = 72000; // $6K/mo
    } else if (revenue <= 5000000) {
      fractionalCFOCost = 96000; // $8K/mo
    } else {
      fractionalCFOCost = 120000; // $10K/mo
    }

    // Bookkeeping is often included or reduced with fractional CFO
    const optimizedBookkeeping = currentBookkeepingAnnual * 0.5; // 50% reduction when integrated

    const newTotalCost = optimizedTaxBurden + optimizedBookkeeping + fractionalCFOCost;
    const totalSavings = currentTotalCost - newTotalCost;
    const roi = fractionalCFOCost > 0 ? ((totalSavings / fractionalCFOCost) * 100) : 0;

    return {
      currentTaxBurden,
      optimizedTaxBurden,
      taxSavings,
      cashFlowSavings,
      currentBookkeepingAnnual,
      optimizedBookkeeping,
      cfoSalary,
      fractionalCFOCost,
      currentTotalCost,
      newTotalCost,
      totalSavings,
      roi,
      effectiveTaxRate: revenue > 0 ? (optimizedTaxBurden / revenue) * 100 : 0,
    };
  }, [annualRevenue, currentTaxRate, monthlyBookkeeping, hasFullTimeCFO, fullTimeCFOSalary]);

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAnnualRevenue(raw);
  };

  const handleBookkeepingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setMonthlyBookkeeping(raw);
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setFullTimeCFOSalary(raw);
  };

  const showResults = parseFloat(annualRevenue) > 0;

  return (
    <section className="py-20 bg-[#0B1120]">
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#D4A853]" />
            <span className="text-[#D4A853] text-sm uppercase tracking-[0.2em] font-medium">
              ROI Calculator
            </span>
            <div className="h-px w-12 bg-[#D4A853]" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-white mt-4 mb-4">
            Calculate Your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #D4A853, #F0D68A, #D4A853)",
              }}
            >
              Potential Savings
            </span>
          </h2>
          <p className="text-[#E8E4DD]/50 max-w-2xl mx-auto">
            See how much your business could save with a Fractional CFO compared to your current
            financial setup. Adjust the inputs below to match your situation.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Panel */}
          <div className="p-8 rounded-sm border border-[#D4A853]/20 bg-[#0D1526]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-sm bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center">
                <Calculator size={20} className="text-[#D4A853]" />
              </div>
              <h3 className="font-serif text-xl text-white">Your Business Details</h3>
            </div>

            <div className="space-y-6">
              {/* Annual Revenue */}
              <div>
                <label className="block text-sm text-[#E8E4DD]/60 mb-2 font-medium">
                  Annual Revenue
                </label>
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A853]/50"
                  />
                  <input
                    type="text"
                    value={parseFloat(annualRevenue).toLocaleString("en-US") || ""}
                    onChange={handleRevenueChange}
                    placeholder="1,000,000"
                    className="w-full pl-10 pr-4 py-3.5 bg-[#0B1120] border border-[#D4A853]/15 rounded-sm text-white placeholder:text-[#E8E4DD]/20 focus:outline-none focus:border-[#D4A853]/50 transition-colors"
                  />
                </div>
              </div>

              {/* Current Effective Tax Rate */}
              <div>
                <label className="block text-sm text-[#E8E4DD]/60 mb-2 font-medium">
                  Current Effective Tax Rate
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="1"
                    value={currentTaxRate}
                    onChange={(e) => setCurrentTaxRate(e.target.value)}
                    className="w-full h-2 bg-[#0B1120] rounded-lg appearance-none cursor-pointer accent-[#D4A853]"
                    style={{
                      background: `linear-gradient(to right, #D4A853 0%, #D4A853 ${((parseFloat(currentTaxRate) - 15) / 35) * 100}%, #1a2235 ${((parseFloat(currentTaxRate) - 15) / 35) * 100}%, #1a2235 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-[#E8E4DD]/30">15%</span>
                    <span className="text-lg font-semibold text-[#D4A853]">{currentTaxRate}%</span>
                    <span className="text-xs text-[#E8E4DD]/30">50%</span>
                  </div>
                </div>
              </div>

              {/* Monthly Bookkeeping Cost */}
              <div>
                <label className="block text-sm text-[#E8E4DD]/60 mb-2 font-medium">
                  Monthly Bookkeeping Cost
                </label>
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A853]/50"
                  />
                  <input
                    type="text"
                    value={parseFloat(monthlyBookkeeping).toLocaleString("en-US") || ""}
                    onChange={handleBookkeepingChange}
                    placeholder="2,000"
                    className="w-full pl-10 pr-4 py-3.5 bg-[#0B1120] border border-[#D4A853]/15 rounded-sm text-white placeholder:text-[#E8E4DD]/20 focus:outline-none focus:border-[#D4A853]/50 transition-colors"
                  />
                </div>
              </div>

              {/* Full-Time CFO Toggle */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-[#E8E4DD]/60 font-medium">
                    Currently paying a full-time CFO?
                  </label>
                  <button
                    onClick={() => setHasFullTimeCFO(!hasFullTimeCFO)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      hasFullTimeCFO ? "bg-[#D4A853]" : "bg-[#1a2235] border border-[#D4A853]/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 ${
                        hasFullTimeCFO
                          ? "translate-x-6 bg-[#0B1120]"
                          : "translate-x-0 bg-[#E8E4DD]/30"
                      }`}
                    />
                  </button>
                </div>
                {hasFullTimeCFO && (
                  <div className="relative mt-2">
                    <DollarSign
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A853]/50"
                    />
                    <input
                      type="text"
                      value={parseFloat(fullTimeCFOSalary).toLocaleString("en-US") || ""}
                      onChange={handleSalaryChange}
                      placeholder="250,000"
                      className="w-full pl-10 pr-4 py-3.5 bg-[#0B1120] border border-[#D4A853]/15 rounded-sm text-white placeholder:text-[#E8E4DD]/20 focus:outline-none focus:border-[#D4A853]/50 transition-colors"
                    />
                    <span className="text-xs text-[#E8E4DD]/30 mt-1 block">Annual salary + benefits</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {showResults ? (
              <>
                {/* Total Savings Card */}
                <div className="p-8 rounded-sm border border-[#D4A853]/30 bg-gradient-to-br from-[#D4A853]/10 to-[#0D1526]">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-[#D4A853]" />
                    <span className="text-sm text-[#D4A853] uppercase tracking-wider font-medium">
                      Estimated Annual Savings
                    </span>
                  </div>
                  <p className="text-4xl md:text-5xl font-serif text-white mb-2">
                    {formatCurrency(Math.max(0, results.totalSavings))}
                  </p>
                  <p className="text-sm text-[#E8E4DD]/40">
                    {results.roi > 0 ? (
                      <>
                        That's a <span className="text-[#D4A853] font-semibold">{formatPercent(results.roi)} ROI</span> on your Fractional CFO investment
                      </>
                    ) : (
                      "Adjust your inputs to see potential savings"
                    )}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="p-6 rounded-sm border border-[#D4A853]/15 bg-[#0D1526]">
                  <h4 className="font-serif text-lg text-white mb-5">Savings Breakdown</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-[#D4A853]/10">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-sm text-[#E8E4DD]/60">Tax Burden Reduction</span>
                      </div>
                      <span className="text-emerald-400 font-semibold">
                        -{formatCurrency(results.taxSavings)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-[#D4A853]/10">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-sm text-[#E8E4DD]/60">Cash Flow Optimization</span>
                      </div>
                      <span className="text-emerald-400 font-semibold">
                        +{formatCurrency(results.cashFlowSavings)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-[#D4A853]/10">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-sm text-[#E8E4DD]/60">Bookkeeping Savings</span>
                      </div>
                      <span className="text-emerald-400 font-semibold">
                        -{formatCurrency(results.currentBookkeepingAnnual - results.optimizedBookkeeping)}
                      </span>
                    </div>
                    {hasFullTimeCFO && (
                      <div className="flex items-center justify-between py-3 border-b border-[#D4A853]/10">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-sm text-[#E8E4DD]/60">Full-Time CFO Replaced</span>
                        </div>
                        <span className="text-emerald-400 font-semibold">
                          -{formatCurrency(results.cfoSalary)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-3 border-b border-[#D4A853]/10">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#D4A853]" />
                        <span className="text-sm text-[#E8E4DD]/60">Fractional CFO Investment</span>
                      </div>
                      <span className="text-[#D4A853] font-semibold">
                        +{formatCurrency(results.fractionalCFOCost)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comparison Bar */}
                <div className="p-6 rounded-sm border border-[#D4A853]/15 bg-[#0D1526]">
                  <h4 className="font-serif text-lg text-white mb-5">Cost Comparison</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-[#E8E4DD]/50 flex items-center gap-2">
                          <TrendingDown size={14} className="text-red-400" /> Current Annual Cost
                        </span>
                        <span className="text-sm text-red-400 font-semibold">
                          {formatCurrency(results.currentTotalCost)}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-[#0B1120] rounded-full overflow-hidden">
                        <div className="h-full bg-red-400/60 rounded-full" style={{ width: "100%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-[#E8E4DD]/50 flex items-center gap-2">
                          <TrendingUp size={14} className="text-emerald-400" /> With Fractional CFO
                        </span>
                        <span className="text-sm text-emerald-400 font-semibold">
                          {formatCurrency(results.newTotalCost)}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-[#0B1120] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400/60 rounded-full transition-all duration-700"
                          style={{
                            width: `${results.currentTotalCost > 0 ? Math.max(5, (results.newTotalCost / results.currentTotalCost) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#D4A853]/10 flex justify-between items-center">
                    <span className="text-sm text-[#E8E4DD]/40">New effective tax rate</span>
                    <span className="text-[#D4A853] font-semibold text-lg">
                      ~{results.effectiveTaxRate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={openQuestionnaire}
                  className="w-full group flex items-center justify-center gap-2 px-8 py-4 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-all duration-300"
                >
                  Start Saving {formatCurrency(Math.max(0, results.totalSavings))}/Year
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-12 rounded-sm border border-[#D4A853]/10 bg-[#0D1526]">
                <div className="text-center">
                  <Calculator size={48} className="mx-auto text-[#D4A853]/20 mb-4" />
                  <h3 className="font-serif text-xl text-white mb-2">Enter Your Details</h3>
                  <p className="text-sm text-[#E8E4DD]/40">
                    Fill in your business details on the left to see your potential savings.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#E8E4DD]/25 mt-8 max-w-2xl mx-auto">
          * These estimates are based on average savings our clients experience. Actual results vary
          depending on your specific business situation, entity structure, and current tax strategy.
          Schedule a free consultation for a personalized analysis.
        </p>
      </div>
    </section>
  );
}
