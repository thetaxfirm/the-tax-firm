import SEOHead from "@/components/SEOHead";
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
        title="The Tax Firm"
        description="The Tax Firm helps small business owners and high-income earners dramatically reduce their tax burden through proactive tax planning, asset protection, and wealth-building strategies."
      />
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
