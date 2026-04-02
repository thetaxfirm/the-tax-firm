import { useEffect } from "react";
import { ArrowRight, TrendingUp, BarChart3, PieChart, DollarSign, FileText, Users, CheckCircle2, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import JsonLd from "@/components/JsonLd";
import CFOCalculator from "@/components/CFOCalculator";
import { useQuestionnaire } from "@/contexts/QuestionnaireContext";

const benefits = [
  {
    icon: TrendingUp,
    title: "Strategic Financial Planning",
    description:
      "We develop forward-looking financial strategies aligned with your business goals, from cash flow forecasting to growth planning and capital allocation.",
  },
  {
    icon: BarChart3,
    title: "Financial Reporting & Analysis",
    description:
      "Get clear, actionable monthly and quarterly financial reports that help you understand exactly where your money is going and where opportunities lie.",
  },
  {
    icon: PieChart,
    title: "Budgeting & Forecasting",
    description:
      "We build detailed budgets and rolling forecasts so you can make confident decisions about hiring, expansion, and investment with real data behind them.",
  },
  {
    icon: DollarSign,
    title: "Cash Flow Management",
    description:
      "Never wonder where your cash went. We implement systems to monitor, predict, and optimize your cash flow so your business always has runway.",
  },
  {
    icon: FileText,
    title: "Tax Strategy Integration",
    description:
      "Unlike standalone CFO services, our fractional CFO work is fully integrated with proactive tax planning — so every financial decision is tax-optimized.",
  },
  {
    icon: Users,
    title: "Investor & Lender Readiness",
    description:
      "Need funding? We prepare your financials, projections, and pitch-ready reports that banks and investors expect to see before writing a check.",
  },
];

const idealFor = [
  "Business owners earning $250K+ who need CFO-level guidance without the $200K+ salary",
  "Companies scaling from 7 to 8 figures that have outgrown their bookkeeper",
  "Entrepreneurs preparing for a funding round, acquisition, or exit",
  "Real estate investors managing multiple entities and complex cash flows",
  "E-commerce and service businesses needing better financial visibility",
];

const process = [
  {
    step: "01",
    title: "Discovery & Assessment",
    description: "We review your current financial systems, reporting, and pain points to understand where you need the most help.",
  },
  {
    step: "02",
    title: "Financial Infrastructure",
    description: "We set up or optimize your chart of accounts, reporting dashboards, and KPI tracking to give you real-time visibility.",
  },
  {
    step: "03",
    title: "Ongoing Strategic Support",
    description: "Monthly strategy sessions, financial reviews, and proactive recommendations to keep your business on track and growing.",
  },
  {
    step: "04",
    title: "Tax-Integrated Planning",
    description: "Every financial decision is made with tax implications in mind — because saving money is just as important as making it.",
  },
];

export default function FractionalCFO() {
  const { openQuestionnaire } = useQuestionnaire();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <SEOHead
        title="Fractional CFO Services"
        description="Get executive-level financial leadership without the full-time cost. The Tax Firm's Fractional CFO services provide strategic financial planning, reporting, budgeting, and cash flow management for growing businesses."
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: "Fractional CFO Services",
        provider: { "@type": "AccountingService", name: "The Tax Firm", url: "https://thetaxfirm.us" },
        areaServed: "US",
        description: "Executive-level financial leadership without the full-time cost. Strategic financial planning, reporting, budgeting, and cash flow management for businesses earning $250K+.",
      }} />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4A853]/5 to-transparent" />
        <div className="container relative">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-[#D4A853]" />
              <span className="text-[#D4A853] text-sm uppercase tracking-[0.2em] font-medium">
                Fractional CFO Services
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
              CFO-Level Financial Strategy{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #D4A853, #F0D68A, #D4A853)",
                }}
              >
                Without the Full-Time Cost.
              </span>
            </h1>
            <p className="text-lg text-[#E8E4DD]/60 leading-relaxed max-w-2xl mb-8">
              Most growing businesses need CFO-level guidance but can't justify a $200K+ salary.
              Our Fractional CFO service gives you the strategic financial leadership your business
              needs — at a fraction of the cost — fully integrated with proactive tax planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={openQuestionnaire}
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-all duration-300"
              >
                Schedule a Free Consultation
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="tel:+17024982144"
                className="flex items-center justify-center gap-2 px-8 py-4 border border-[#D4A853]/30 text-[#D4A853] rounded-sm hover:bg-[#D4A853]/10 transition-all duration-300"
              >
                <Phone size={18} />
                (702) 498-2144
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-[#0D1526]">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-[#D4A853] text-sm uppercase tracking-[0.2em] font-medium">
              What You Get
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-white mt-4 mb-4">
              Comprehensive Financial Leadership
            </h2>
            <p className="text-[#E8E4DD]/50 max-w-2xl mx-auto">
              Our Fractional CFO service covers everything from day-to-day financial oversight to
              long-term strategic planning — all with a tax-first mindset.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="group p-8 rounded-sm border border-[#D4A853]/10 bg-[#0B1120]/50 hover:border-[#D4A853]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-sm bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center mb-5 group-hover:bg-[#D4A853]/20 transition-colors">
                  <benefit.icon size={22} className="text-[#D4A853]" />
                </div>
                <h3 className="font-serif text-xl text-white mb-3">{benefit.title}</h3>
                <p className="text-sm text-[#E8E4DD]/50 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 bg-[#0B1120]">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#D4A853] text-sm uppercase tracking-[0.2em] font-medium">
                Is This Right For You?
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-white mt-4 mb-6">
                Ideal For Growing Businesses
              </h2>
              <p className="text-[#E8E4DD]/50 leading-relaxed mb-8">
                Our Fractional CFO service is designed for business owners who are past the startup
                phase and need real financial strategy — not just someone to file their taxes.
              </p>
              <ul className="space-y-4">
                {idealFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-[#D4A853] mt-0.5 shrink-0" />
                    <span className="text-[#E8E4DD]/70 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="p-8 rounded-sm border border-[#D4A853]/20 bg-[#0D1526]">
                <h3 className="font-serif text-2xl text-white mb-4">The Cost of Not Having a CFO</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-[#D4A853]/10">
                    <span className="text-[#E8E4DD]/50 text-sm">Missed tax savings</span>
                    <span className="text-red-400 font-semibold">$20K – $100K+/yr</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#D4A853]/10">
                    <span className="text-[#E8E4DD]/50 text-sm">Poor cash flow decisions</span>
                    <span className="text-red-400 font-semibold">$50K – $250K+/yr</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#D4A853]/10">
                    <span className="text-[#E8E4DD]/50 text-sm">Overpaying on overhead</span>
                    <span className="text-red-400 font-semibold">$30K – $150K+/yr</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#D4A853]/10">
                    <span className="text-[#E8E4DD]/50 text-sm">Full-time CFO salary</span>
                    <span className="text-red-400 font-semibold">$200K – $350K+/yr</span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-white font-semibold">Our Fractional CFO</span>
                    <span className="text-[#D4A853] font-bold text-lg">Fraction of the cost</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-[#0D1526]">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-[#D4A853] text-sm uppercase tracking-[0.2em] font-medium">
              How It Works
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-white mt-4">
              Our Fractional CFO Process
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((item) => (
              <div key={item.step} className="relative p-6 rounded-sm border border-[#D4A853]/10 bg-[#0B1120]/50">
                <span className="text-5xl font-serif text-[#D4A853]/15 absolute top-4 right-4">
                  {item.step}
                </span>
                <div className="relative">
                  <span className="text-[#D4A853] text-xs uppercase tracking-wider font-medium">
                    Step {item.step}
                  </span>
                  <h3 className="font-serif text-lg text-white mt-2 mb-3">{item.title}</h3>
                  <p className="text-sm text-[#E8E4DD]/50 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <CFOCalculator />

      {/* CTA */}
      <section className="py-20 bg-[#0D1526]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">
              Ready for{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #D4A853, #F0D68A, #D4A853)",
                }}
              >
                CFO-Level Strategy?
              </span>
            </h2>
            <p className="text-[#E8E4DD]/50 mb-8 max-w-xl mx-auto">
              Schedule a free consultation to discuss how our Fractional CFO service can transform
              your business finances and help you keep more of what you earn.
            </p>
            <button
              onClick={openQuestionnaire}
              className="group inline-flex items-center gap-2 px-10 py-4 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-all duration-300"
            >
              Schedule a Free Consultation
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
