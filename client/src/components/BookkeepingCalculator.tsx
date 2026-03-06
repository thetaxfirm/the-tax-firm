import { useState, useMemo } from "react";
import { Calculator, DollarSign, ArrowRight, Building2, Users, BarChart3, CheckCircle2 } from "lucide-react";
import { useQuestionnaire } from "@/contexts/QuestionnaireContext";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

type BusinessType = "solo" | "small" | "medium" | "multi";
type ComplexityLevel = "simple" | "moderate" | "complex";

const businessTypes: { value: BusinessType; label: string; icon: typeof Building2; description: string }[] = [
  { value: "solo", label: "Solo / Freelancer", icon: Users, description: "1 owner, no employees" },
  { value: "small", label: "Small Business", icon: Building2, description: "1-10 employees" },
  { value: "medium", label: "Growing Business", icon: BarChart3, description: "11-50 employees" },
  { value: "multi", label: "Multi-Entity", icon: Building2, description: "Multiple LLCs or corps" },
];

const complexityLevels: { value: ComplexityLevel; label: string; description: string }[] = [
  { value: "simple", label: "Simple", description: "Mostly income & standard expenses" },
  { value: "moderate", label: "Moderate", description: "Inventory, contractors, or multiple revenue streams" },
  { value: "complex", label: "Complex", description: "Real estate, investments, international, or multi-state" },
];

const packageRecommendations: Record<string, { name: string; features: string[] }> = {
  essentials: {
    name: "Essentials",
    features: [
      "Monthly transaction categorization",
      "Bank & credit card reconciliation",
      "Monthly P&L statement",
      "Annual 1099 preparation",
      "Email support",
    ],
  },
  growth: {
    name: "Growth",
    features: [
      "Everything in Essentials",
      "Accounts payable & receivable",
      "Payroll processing",
      "Monthly P&L, balance sheet & cash flow",
      "Quarterly tax estimates",
      "Dedicated bookkeeper",
    ],
  },
  enterprise: {
    name: "Enterprise",
    features: [
      "Everything in Growth",
      "Multi-entity bookkeeping",
      "Custom financial reporting",
      "Inventory tracking",
      "CFO-level financial review",
      "Priority support & strategy calls",
    ],
  },
};

export default function BookkeepingCalculator() {
  const { openQuestionnaire } = useQuestionnaire();
  const [monthlyTransactions, setMonthlyTransactions] = useState<string>("150");
  const [businessType, setBusinessType] = useState<BusinessType>("small");
  const [complexity, setComplexity] = useState<ComplexityLevel>("moderate");
  const [needsPayroll, setNeedsPayroll] = useState(false);
  const [employeeCount, setEmployeeCount] = useState<string>("5");

  const results = useMemo(() => {
    const transactions = parseInt(monthlyTransactions.replace(/,/g, "")) || 0;
    const employees = needsPayroll ? parseInt(employeeCount.replace(/,/g, "")) || 0 : 0;

    // Base cost per transaction (tiered)
    let costPerTransaction: number;
    if (transactions <= 50) {
      costPerTransaction = 3.5;
    } else if (transactions <= 150) {
      costPerTransaction = 2.8;
    } else if (transactions <= 300) {
      costPerTransaction = 2.2;
    } else if (transactions <= 500) {
      costPerTransaction = 1.8;
    } else {
      costPerTransaction = 1.5;
    }

    // Business type multiplier
    const businessMultiplier: Record<BusinessType, number> = {
      solo: 0.8,
      small: 1.0,
      medium: 1.3,
      multi: 1.7,
    };

    // Complexity multiplier
    const complexityMultiplier: Record<ComplexityLevel, number> = {
      simple: 0.85,
      moderate: 1.0,
      complex: 1.35,
    };

    // Base monthly cost
    let baseMonthlyCost = Math.max(
      250, // minimum
      transactions * costPerTransaction * businessMultiplier[businessType] * complexityMultiplier[complexity]
    );

    // Payroll add-on
    const payrollCost = needsPayroll ? Math.max(100, employees * 25) : 0;

    // Total monthly cost
    const totalMonthlyCost = Math.round(baseMonthlyCost + payrollCost);
    const annualCost = totalMonthlyCost * 12;

    // Annual savings vs DIY (estimated time value)
    const hoursPerMonth = Math.max(4, transactions * 0.08 + (needsPayroll ? employees * 0.5 : 0));
    const ownerHourlyRate = 150; // estimated value of owner's time
    const diyMonthlyCost = hoursPerMonth * ownerHourlyRate;
    const monthlySavings = Math.max(0, diyMonthlyCost - totalMonthlyCost);
    const annualTimeSaved = Math.round(hoursPerMonth * 12);

    // Recommended package
    let recommendedPackage: string;
    if (businessType === "solo" && complexity === "simple" && !needsPayroll) {
      recommendedPackage = "essentials";
    } else if (businessType === "multi" || complexity === "complex") {
      recommendedPackage = "enterprise";
    } else {
      recommendedPackage = "growth";
    }

    // Tax savings from professional bookkeeping (missed deductions recovery)
    const estimatedMissedDeductions = transactions * 8 * 12; // avg $8 per transaction in missed deductions annually
    const taxSavingsFromDeductions = Math.round(estimatedMissedDeductions * 0.3); // 30% tax rate

    return {
      baseMonthlyCost: Math.round(baseMonthlyCost),
      payrollCost,
      totalMonthlyCost,
      annualCost,
      diyMonthlyCost: Math.round(diyMonthlyCost),
      monthlySavings: Math.round(monthlySavings),
      annualTimeSaved,
      hoursPerMonth: Math.round(hoursPerMonth),
      recommendedPackage,
      taxSavingsFromDeductions,
    };
  }, [monthlyTransactions, businessType, complexity, needsPayroll, employeeCount]);

  const handleTransactionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setMonthlyTransactions(raw);
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setEmployeeCount(raw);
  };

  const recommended = packageRecommendations[results.recommendedPackage];

  return (
    <section className="py-20 bg-[#0B1120]">
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#D4A853]" />
            <span className="text-[#D4A853] text-sm uppercase tracking-[0.2em] font-medium">
              Pricing Calculator
            </span>
            <div className="h-px w-12 bg-[#D4A853]" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-white mt-4 mb-4">
            Estimate Your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #D4A853, #F0D68A, #D4A853)",
              }}
            >
              Monthly Investment
            </span>
          </h2>
          <p className="text-[#E8E4DD]/50 max-w-2xl mx-auto">
            Get an instant estimate based on your business size, transaction volume, and complexity.
            Every quote is customized — this calculator gives you a starting point.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Panel */}
          <div className="p-8 rounded-sm border border-[#D4A853]/20 bg-[#0D1526]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-sm bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center">
                <Calculator size={20} className="text-[#D4A853]" />
              </div>
              <h3 className="font-serif text-xl text-white">Your Business Profile</h3>
            </div>

            <div className="space-y-6">
              {/* Business Type */}
              <div>
                <label className="block text-sm text-[#E8E4DD]/60 mb-3 font-medium">
                  Business Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {businessTypes.map((bt) => (
                    <button
                      key={bt.value}
                      onClick={() => setBusinessType(bt.value)}
                      className={`p-3 rounded-sm border text-left transition-all duration-300 ${
                        businessType === bt.value
                          ? "border-[#D4A853] bg-[#D4A853]/10"
                          : "border-[#D4A853]/10 bg-[#0B1120]/50 hover:border-[#D4A853]/30"
                      }`}
                    >
                      <bt.icon
                        size={16}
                        className={`mb-1 ${
                          businessType === bt.value ? "text-[#D4A853]" : "text-[#E8E4DD]/30"
                        }`}
                      />
                      <div
                        className={`text-xs font-semibold ${
                          businessType === bt.value ? "text-white" : "text-[#E8E4DD]/50"
                        }`}
                      >
                        {bt.label}
                      </div>
                      <div className="text-[10px] text-[#E8E4DD]/30 mt-0.5">{bt.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Transactions */}
              <div>
                <label className="block text-sm text-[#E8E4DD]/60 mb-2 font-medium">
                  Monthly Transactions
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={monthlyTransactions}
                    onChange={(e) => setMonthlyTransactions(e.target.value)}
                    className="w-full h-2 bg-[#0B1120] rounded-lg appearance-none cursor-pointer accent-[#D4A853]"
                    style={{
                      background: `linear-gradient(to right, #D4A853 0%, #D4A853 ${((parseInt(monthlyTransactions) - 10) / 990) * 100}%, #1a2235 ${((parseInt(monthlyTransactions) - 10) / 990) * 100}%, #1a2235 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-[#E8E4DD]/30">10</span>
                    <span className="text-lg font-semibold text-[#D4A853]">
                      {parseInt(monthlyTransactions).toLocaleString()} txns/mo
                    </span>
                    <span className="text-xs text-[#E8E4DD]/30">1,000</span>
                  </div>
                </div>
              </div>

              {/* Complexity */}
              <div>
                <label className="block text-sm text-[#E8E4DD]/60 mb-3 font-medium">
                  Business Complexity
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {complexityLevels.map((cl) => (
                    <button
                      key={cl.value}
                      onClick={() => setComplexity(cl.value)}
                      className={`p-3 rounded-sm border text-center transition-all duration-300 ${
                        complexity === cl.value
                          ? "border-[#D4A853] bg-[#D4A853]/10"
                          : "border-[#D4A853]/10 bg-[#0B1120]/50 hover:border-[#D4A853]/30"
                      }`}
                    >
                      <div
                        className={`text-xs font-semibold ${
                          complexity === cl.value ? "text-white" : "text-[#E8E4DD]/50"
                        }`}
                      >
                        {cl.label}
                      </div>
                      <div className="text-[9px] text-[#E8E4DD]/30 mt-1 leading-tight">
                        {cl.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payroll Toggle */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-[#E8E4DD]/60 font-medium">
                    Need payroll processing?
                  </label>
                  <button
                    onClick={() => setNeedsPayroll(!needsPayroll)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      needsPayroll ? "bg-[#D4A853]" : "bg-[#1a2235] border border-[#D4A853]/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 ${
                        needsPayroll
                          ? "translate-x-6 bg-[#0B1120]"
                          : "translate-x-0 bg-[#E8E4DD]/30"
                      }`}
                    />
                  </button>
                </div>
                {needsPayroll && (
                  <div className="relative mt-2">
                    <Users
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A853]/50"
                    />
                    <input
                      type="text"
                      value={employeeCount}
                      onChange={handleEmployeeChange}
                      placeholder="5"
                      className="w-full pl-10 pr-4 py-3.5 bg-[#0B1120] border border-[#D4A853]/15 rounded-sm text-white placeholder:text-[#E8E4DD]/20 focus:outline-none focus:border-[#D4A853]/50 transition-colors"
                    />
                    <span className="text-xs text-[#E8E4DD]/30 mt-1 block">Number of employees</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Monthly Estimate Card */}
            <div className="p-8 rounded-sm border border-[#D4A853]/30 bg-gradient-to-br from-[#D4A853]/10 to-[#0D1526]">
              <span className="text-sm text-[#D4A853] uppercase tracking-wider font-medium">
                Estimated Monthly Cost
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-4xl md:text-5xl font-serif text-white">
                  {formatCurrency(results.totalMonthlyCost)}
                </p>
                <span className="text-[#E8E4DD]/30 text-lg">/month</span>
              </div>
              <p className="text-sm text-[#E8E4DD]/40 mt-2">
                {formatCurrency(results.annualCost)} annually
              </p>
            </div>

            {/* Cost Breakdown */}
            <div className="p-6 rounded-sm border border-[#D4A853]/15 bg-[#0D1526]">
              <h4 className="font-serif text-lg text-white mb-5">Cost Breakdown</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#D4A853]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4A853]" />
                    <span className="text-sm text-[#E8E4DD]/60">Base Bookkeeping</span>
                  </div>
                  <span className="text-white font-semibold">
                    {formatCurrency(results.baseMonthlyCost)}/mo
                  </span>
                </div>
                {needsPayroll && (
                  <div className="flex items-center justify-between py-3 border-b border-[#D4A853]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#D4A853]" />
                      <span className="text-sm text-[#E8E4DD]/60">Payroll Processing</span>
                    </div>
                    <span className="text-white font-semibold">
                      +{formatCurrency(results.payrollCost)}/mo
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Value Comparison */}
            <div className="p-6 rounded-sm border border-[#D4A853]/15 bg-[#0D1526]">
              <h4 className="font-serif text-lg text-white mb-5">The Value You Get</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#D4A853]/10">
                  <span className="text-sm text-[#E8E4DD]/60">DIY cost (your time)</span>
                  <span className="text-red-400 font-semibold">
                    {formatCurrency(results.diyMonthlyCost)}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#D4A853]/10">
                  <span className="text-sm text-[#E8E4DD]/60">Professional bookkeeping</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatCurrency(results.totalMonthlyCost)}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#D4A853]/10">
                  <span className="text-sm text-[#E8E4DD]/60">Monthly time saved</span>
                  <span className="text-[#D4A853] font-semibold">
                    ~{results.hoursPerMonth} hours
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#D4A853]/10">
                  <span className="text-sm text-[#E8E4DD]/60">Annual time reclaimed</span>
                  <span className="text-[#D4A853] font-semibold">
                    {results.annualTimeSaved} hours
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-[#E8E4DD]/60">Est. tax savings from clean books</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatCurrency(results.taxSavingsFromDeductions)}/yr
                  </span>
                </div>
              </div>
            </div>

            {/* Recommended Package */}
            {recommended && (
              <div className="p-6 rounded-sm border border-[#D4A853]/30 bg-[#D4A853]/5">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={16} className="text-[#D4A853]" />
                  <span className="text-sm text-[#D4A853] uppercase tracking-wider font-medium">
                    Recommended Plan
                  </span>
                </div>
                <h4 className="font-serif text-2xl text-white mb-4">
                  {recommended.name} Package
                </h4>
                <ul className="space-y-2 mb-6">
                  {recommended.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-[#D4A853] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#E8E4DD]/60">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={openQuestionnaire}
              className="w-full group flex items-center justify-center gap-2 px-8 py-4 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-all duration-300"
            >
              Get Your Custom Quote
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#E8E4DD]/25 mt-8 max-w-2xl mx-auto">
          * These estimates are based on typical pricing for businesses of similar size and complexity.
          Your actual quote may vary based on specific needs. Schedule a free consultation for an
          exact quote tailored to your business.
        </p>
      </div>
    </section>
  );
}
