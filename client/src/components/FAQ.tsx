import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/faqData";

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="relative py-24 sm:py-32 section-dark" ref={ref}>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4A853]/3 rounded-full blur-[200px]" />

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
              Common Questions
            </span>
            <div className="h-px w-12 bg-[#D4A853]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-[#E8E4DD]/60 max-w-2xl mx-auto">
            Everything you need to know about working with The Tax Firm.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass-card rounded-sm px-6 border-[#D4A853]/10 data-[state=open]:border-[#D4A853]/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-[#E8E4DD] hover:text-[#D4A853] font-medium py-5 text-base [&[data-state=open]]:text-[#D4A853]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#E8E4DD]/60 leading-relaxed pb-5 text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
