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
                  Tax Strategy & Planning
                </span>
              </div>
            </div>
            <p className="text-sm text-[#E8E4DD]/40 leading-relaxed max-w-xs">
              Helping small business owners and high-income earners reduce taxes, protect assets, and build generational wealth.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Services
            </h4>
            <ul className="space-y-2.5">
              {["Tax Mitigation", "Asset Protection", "Wealth Building", "Tax Planning", "Entity Structuring"].map(
                (item) => (
                  <li key={item}>
                    <a href="#services" className="text-sm text-[#E8E4DD]/40 hover:text-[#D4A853] transition-colors">
                      {item}
                    </a>
                  </li>
                )
              )}
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
          <p className="text-xs text-[#E8E4DD]/20">
            Tax planning services. Not legal or financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
