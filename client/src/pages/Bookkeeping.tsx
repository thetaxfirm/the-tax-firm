import { useEffect } from "react";
import { ArrowRight, BookOpen, Calculator, ClipboardCheck, Receipt, FileBarChart, ShieldCheck, CheckCircle2, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuestionnaire } from "@/contexts/QuestionnaireContext";

const services = [
  {
    icon: BookOpen,
    title: "Full-Service Bookkeeping",
    description:
      "We handle all your day-to-day bookkeeping — categorizing transactions, reconciling accounts, and keeping your books clean and current so you never fall behind.",
  },
  {
    icon: Receipt,
    title: "Accounts Payable & Receivable",
    description:
      "Stay on top of who owes you and what you owe. We manage your AP/AR to ensure timely payments, healthy cash flow, and accurate aging reports.",
  },
  {
    icon: Calculator,
    title: "Payroll Processing",
    description:
      "From calculating wages and withholdings to filing payroll taxes, we ensure your team gets paid accurately and on time — every time.",
  },
  {
    icon: FileBarChart,
    title: "Monthly Financial Statements",
    description:
      "Receive clear, accurate P&L statements, balance sheets, and cash flow reports every month so you always know exactly where your business stands.",
  },
  {
    icon: ClipboardCheck,
    title: "Tax-Ready Books",
    description:
      "Our bookkeeping is done with tax season in mind. Your books are always organized and ready for filing, eliminating the year-end scramble.",
  },
  {
    icon: ShieldCheck,
    title: "Audit-Proof Records",
    description:
      "We maintain meticulous records with proper documentation so if the IRS ever comes knocking, your books are bulletproof and audit-ready.",
  },
];

const packages = [
  {
    name: "Essentials",
    description: "For solo entrepreneurs and small businesses just getting started",
    features: [
      "Monthly transaction categorization",
      "Bank & credit card reconciliation",
      "Monthly P&L statement",
      "Annual 1099 preparation",
      "Email support",
    ],
    highlight: false,
  },
  {
    name: "Growth",
    description: "For established businesses that need comprehensive financial management",
    features: [
      "Everything in Essentials",
      "Accounts payable & receivable",
      "Payroll processing",
      "Monthly P&L, balance sheet & cash flow",
      "Quarterly tax estimates",
      "Dedicated bookkeeper",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    description: "For multi-entity businesses and high-volume operations",
    features: [
      "Everything in Growth",
      "Multi-entity bookkeeping",
      "Custom financial reporting",
      "Inventory tracking",
      "CFO-level financial review",
      "Priority support & strategy calls",
    ],
    highlight: false,
  },
];

const whyUs = [
  {
    title: "Tax-Integrated Approach",
    description: "Unlike generic bookkeepers, every entry we make is done with your tax strategy in mind — maximizing deductions and minimizing liability year-round.",
  },
  {
    title: "Industry Expertise",
    description: "We specialize in small businesses, real estate investors, and high-income professionals — so we understand your unique financial needs.",
  },
  {
    title: "Technology-Forward",
    description: "We use modern cloud-based tools like QuickBooks Online and Xero, giving you real-time access to your financials from anywhere.",
  },
  {
    title: "Seamless Integration",
    description: "Our bookkeeping feeds directly into our tax planning and Fractional CFO services — creating a unified financial ecosystem for your business.",
  },
];

export default function Bookkeeping() {
  const { openQuestionnaire } = useQuestionnaire();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4A853]/5 to-transparent" />
        <div className="container relative">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-[#D4A853]" />
              <span className="text-[#D4A853] text-sm uppercase tracking-[0.2em] font-medium">
                Bookkeeping Services
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
              Clean Books.{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #D4A853, #F0D68A, #D4A853)",
                }}
              >
                Clear Picture.
              </span>
              <br />
              Lower Taxes.
            </h1>
            <p className="text-lg text-[#E8E4DD]/60 leading-relaxed max-w-2xl mb-8">
              Messy books cost you money — in missed deductions, late fees, and poor decisions.
              Our bookkeeping service keeps your finances organized, tax-optimized, and always
              ready for whatever comes next.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={openQuestionnaire}
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-all duration-300"
              >
                Get a Free Quote
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

      {/* Services Grid */}
      <section className="py-20 bg-[#0D1526]">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-[#D4A853] text-sm uppercase tracking-[0.2em] font-medium">
              What We Handle
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-white mt-4 mb-4">
              Complete Bookkeeping Solutions
            </h2>
            <p className="text-[#E8E4DD]/50 max-w-2xl mx-auto">
              From daily transactions to monthly reporting, we handle every aspect of your
              bookkeeping so you can focus on running your business.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="group p-8 rounded-sm border border-[#D4A853]/10 bg-[#0B1120]/50 hover:border-[#D4A853]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-sm bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center mb-5 group-hover:bg-[#D4A853]/20 transition-colors">
                  <service.icon size={22} className="text-[#D4A853]" />
                </div>
                <h3 className="font-serif text-xl text-white mb-3">{service.title}</h3>
                <p className="text-sm text-[#E8E4DD]/50 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 bg-[#0B1120]">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-[#D4A853] text-sm uppercase tracking-[0.2em] font-medium">
              Our Packages
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-white mt-4 mb-4">
              Bookkeeping Plans That Scale With You
            </h2>
            <p className="text-[#E8E4DD]/50 max-w-2xl mx-auto">
              Every business is different. Choose the level of support that fits your needs,
              and upgrade anytime as you grow.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative p-8 rounded-sm border transition-all duration-300 ${
                  pkg.highlight
                    ? "border-[#D4A853]/40 bg-[#D4A853]/5"
                    : "border-[#D4A853]/10 bg-[#0D1526]/50"
                }`}
              >
                {pkg.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#D4A853] text-[#0B1120] text-xs font-bold uppercase tracking-wider rounded-sm">
                    Most Popular
                  </div>
                )}
                <h3 className="font-serif text-2xl text-white mb-2">{pkg.name}</h3>
                <p className="text-sm text-[#E8E4DD]/40 mb-6">{pkg.description}</p>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-[#D4A853] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#E8E4DD]/60">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={openQuestionnaire}
                  className={`w-full py-3 rounded-sm font-semibold text-sm transition-all duration-300 ${
                    pkg.highlight
                      ? "bg-[#D4A853] text-[#0B1120] hover:bg-[#F0D68A]"
                      : "border border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/10"
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-[#0D1526]">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-[#D4A853] text-sm uppercase tracking-[0.2em] font-medium">
              The Tax Firm Difference
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-white mt-4">
              Why Our Bookkeeping Is Different
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {whyUs.map((item, i) => (
              <div
                key={i}
                className="flex gap-5 p-6 rounded-sm border border-[#D4A853]/10 bg-[#0B1120]/50"
              >
                <div className="w-10 h-10 rounded-sm bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#D4A853] font-serif font-bold">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[#E8E4DD]/50 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0B1120]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">
              Stop Losing Money to{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #D4A853, #F0D68A, #D4A853)",
                }}
              >
                Messy Books.
              </span>
            </h2>
            <p className="text-[#E8E4DD]/50 mb-8 max-w-xl mx-auto">
              Let us take bookkeeping off your plate so you can focus on what you do best —
              growing your business. Schedule a free consultation today.
            </p>
            <button
              onClick={openQuestionnaire}
              className="group inline-flex items-center gap-2 px-10 py-4 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-all duration-300"
            >
              Get a Free Quote
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
