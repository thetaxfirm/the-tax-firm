import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "About", href: "#about" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0B1120]/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-[#D4A853]/10"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-20">
        {/* Logo */}
        <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-sm border border-[#D4A853]/60 flex items-center justify-center bg-[#D4A853]/10 group-hover:bg-[#D4A853]/20 transition-colors">
            <span className="font-serif text-[#D4A853] text-lg font-bold">T</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg text-white leading-tight tracking-wide">The Tax Firm</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4A853]/70">Tax Strategy & Planning</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm text-[#E8E4DD]/70 hover:text-[#D4A853] transition-colors duration-300 tracking-wide"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <a href="tel:+1" className="flex items-center gap-2 text-sm text-[#E8E4DD]/60 hover:text-[#D4A853] transition-colors">
            <Phone size={14} />
          </a>
          <a
            href="https://www.thetaxfirm.us"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-[#D4A853] text-[#0B1120] text-sm font-semibold rounded-sm hover:bg-[#F0D68A] transition-all duration-300 tracking-wide"
          >
            Free Discovery Call
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-[#E8E4DD] p-2"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0B1120]/98 backdrop-blur-xl border-t border-[#D4A853]/10"
          >
            <div className="container py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-left text-[#E8E4DD]/80 hover:text-[#D4A853] transition-colors py-2 text-lg tracking-wide"
                >
                  {link.label}
                </button>
              ))}
              <a
                href="https://www.thetaxfirm.us"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-6 py-3 bg-[#D4A853] text-[#0B1120] text-center font-semibold rounded-sm hover:bg-[#F0D68A] transition-all duration-300"
              >
                Schedule a Free Discovery Call
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
