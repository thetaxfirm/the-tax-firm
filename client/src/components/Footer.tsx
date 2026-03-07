import { Phone, Mail, Facebook, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#080D1A] border-t border-[#D4A853]/10">
      <div className="container py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-sm border border-[#D4A853]/60 flex items-center justify-center bg-[#D4A853]/10">
                <span className="font-serif text-[#D4A853] text-lg font-bold">T</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg text-white leading-tight">The Tax Firm</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4A853]/70">
                  Tax Strategy & Planning, Fractional CFO, Bookkeeping
                </span>
              </div>
            </div>
            <p className="text-sm text-[#E8E4DD]/40 leading-relaxed max-w-xs mb-4">
              Helping small business owners and high-income earners reduce taxes, protect assets, and build generational wealth.
            </p>
            <div className="space-y-2">
              <a href="tel:+17024982144" className="flex items-center gap-2 text-sm text-[#E8E4DD]/40 hover:text-[#D4A853] transition-colors">
                <Phone size={14} className="text-[#D4A853]" />
                <span>(702) 498-2144</span>
              </a>
              <a href="mailto:chris@thetaxfirm.us" className="flex items-center gap-2 text-sm text-[#E8E4DD]/40 hover:text-[#D4A853] transition-colors">
                <Mail size={14} className="text-[#D4A853]" />
                <span>chris@thetaxfirm.us</span>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Services
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Tax Mitigation", href: "#services" },
                { label: "Asset Protection", href: "#services" },
                { label: "Wealth Building", href: "#services" },
                { label: "Fractional CFO", href: "/services/fractional-cfo" },
                { label: "Bookkeeping", href: "/services/bookkeeping" },
                { label: "Entity Structuring", href: "#services" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-[#E8E4DD]/40 hover:text-[#D4A853] transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "#about" },
                { label: "Our Process", href: "#process" },
                { label: "Testimonials", href: "#testimonials" },
                { label: "Blog & Resources", href: "/blog" },
                { label: "Client Portal", href: "/portal" },
                { label: "FAQ", href: "#faq" },
                { label: "Contact", href: "#contact" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-[#E8E4DD]/40 hover:text-[#D4A853] transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Disclaimer"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-[#E8E4DD]/40 hover:text-[#D4A853] transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#D4A853]/10 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#E8E4DD]/30">
            {currentYear} &copy; The Tax Firm — All Rights Reserved
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/chriscraig702"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-sm border border-[#D4A853]/10 flex items-center justify-center text-[#E8E4DD]/30 hover:text-[#D4A853] hover:border-[#D4A853]/30 transition-all duration-300"
              aria-label="Facebook"
            >
              <Facebook size={14} />
            </a>
            <a
              href="https://www.linkedin.com/in/christophercraigofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-sm border border-[#D4A853]/10 flex items-center justify-center text-[#E8E4DD]/30 hover:text-[#D4A853] hover:border-[#D4A853]/30 transition-all duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin size={14} />
            </a>
            <a
              href="https://www.instagram.com/christophercraigofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-sm border border-[#D4A853]/10 flex items-center justify-center text-[#E8E4DD]/30 hover:text-[#D4A853] hover:border-[#D4A853]/30 transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram size={14} />
            </a>
          </div>
          <p className="text-xs text-[#E8E4DD]/20">
            Tax planning services. Not legal or financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
