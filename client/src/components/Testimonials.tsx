import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marylin",
    location: "Des Moines, IA",
    quote:
      "Before working with The Tax Firm, I was paying way too much in taxes and didn't even know it. Christopher and his team completely transformed my tax strategy. They found deductions and structures I never knew existed. I saved over $40,000 in my first year alone.",
    role: "Small Business Owner",
    initials: "M",
  },
  {
    name: "Freedom",
    location: "Dallas, TX",
    quote:
      "I had been using the same CPA for years and thought I was in good shape. The Tax Firm showed me how much money I was leaving on the table. Their proactive approach to tax planning is unlike anything I've experienced. They truly care about building your wealth.",
    role: "Real Estate Investor",
    initials: "F",
  },
  {
    name: "Emma",
    location: "Houston, TX",
    quote:
      "The Tax Firm doesn't just prepare your taxes — they plan your entire financial future. Christopher took the time to understand my business and personal goals, then built a strategy that protects my assets and minimizes my tax burden. Absolutely worth every penny.",
    role: "Healthcare Professional",
    initials: "E",
  },
  {
    name: "Stephane",
    location: "Pella, IA",
    quote:
      "I was skeptical at first, but the results speak for themselves. The Tax Firm restructured my business entities and implemented strategies that cut my tax liability significantly. They're responsive, knowledgeable, and genuinely invested in my success.",
    role: "Business Owner",
    initials: "S",
  },
  {
    name: "Charles",
    location: "Fargo, ND",
    quote:
      "Working with The Tax Firm has been a game-changer. Their team goes above and beyond what any traditional CPA would do. They helped me with asset protection, tax mitigation, and a clear path to building generational wealth. I recommend them to everyone I know.",
    role: "High-Income Professional",
    initials: "C",
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [current, setCurrent] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="relative py-24 sm:py-32 overflow-hidden" ref={ref}>
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
              Client Success Stories
            </span>
            <div className="h-px w-12 bg-[#D4A853]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#0B1120] leading-tight">
            What Our Clients Say
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          {/* Main testimonial card */}
          <div className="relative bg-[#0B1120] rounded-sm p-8 sm:p-12 shadow-2xl overflow-hidden">
            <Quote size={80} className="text-[#D4A853]/5 absolute -top-2 -right-2" />

            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="text-[#D4A853] fill-[#D4A853]" />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <p className="font-quote italic text-lg sm:text-xl text-[#E8E4DD]/80 leading-relaxed mb-8 min-h-[120px]">
                  "{testimonials[current].quote}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4A853]/20 border border-[#D4A853]/30 flex items-center justify-center">
                    <span className="font-serif text-[#D4A853] text-lg">
                      {testimonials[current].initials}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-lg">
                      {testimonials[current].name}
                    </div>
                    <div className="text-[#D4A853] text-sm">
                      {testimonials[current].role} — {testimonials[current].location}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#D4A853]/10">
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === current
                        ? "bg-[#D4A853] w-8"
                        : "bg-[#D4A853]/20 w-1.5 hover:bg-[#D4A853]/40"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full border border-[#D4A853]/20 flex items-center justify-center text-[#D4A853] hover:bg-[#D4A853]/10 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full border border-[#D4A853]/20 flex items-center justify-center text-[#D4A853] hover:bg-[#D4A853]/10 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
