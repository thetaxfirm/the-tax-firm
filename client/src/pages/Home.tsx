import SEOHead from "@/components/SEOHead";
import JsonLd from "@/components/JsonLd";
import { faqs } from "@/data/faqData";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import PainPoints from "@/components/PainPoints";
import WhyUs from "@/components/WhyUs";
import Services from "@/components/Services";
import SavingsHighlight from "@/components/SavingsHighlight";
import Process from "@/components/Process";
import About from "@/components/About";
import TaxCalculator from "@/components/TaxCalculator";
import Testimonials from "@/components/Testimonials";
import BlogPreview from "@/components/BlogPreview";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B1120]">
      <SEOHead
        title="Tax Strategy & Planning for Business Owners"
        description="Reduce your tax burden with proactive tax planning, asset protection, and wealth-building strategies for small business owners and high-income earners."
        keywords="tax strategy, tax planning, tax reduction, asset protection, wealth building, small business taxes, enrolled agent, Las Vegas tax firm, fractional CFO, bookkeeping, Roth conversion, cost segregation"
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }} />
      <Navbar />
      <Hero />
      <TrustStrip />
      <PainPoints />
      <WhyUs />
      <Services />
      <SavingsHighlight />
      <Process />
      <About />
      <TaxCalculator />
      <Testimonials />
      <BlogPreview />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}
