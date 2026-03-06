import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How is The Tax Firm different from a regular CPA?",
    answer:
      "Most CPAs focus on tax compliance — filing your returns after the year is over. We focus on tax strategy and planning. We work proactively throughout the year to structure your business, income, and investments in ways that legally minimize your tax burden. We look at your entire financial picture, not just your tax return.",
  },
  {
    question: "Who are your typical clients?",
    answer:
      "We primarily serve small business owners and high-income employees who are frustrated with paying too much in taxes. Our clients typically earn $200,000 or more annually and are looking for advanced strategies beyond what their current CPA provides. We work with professionals, real estate investors, entrepreneurs, and executives.",
  },
  {
    question: "How much can I expect to save?",
    answer:
      "While every situation is unique, our clients typically see tax savings of 20-40% or more compared to what they were paying before. During your free discovery call, we can give you a preliminary estimate based on your specific situation. Some clients have saved tens of thousands of dollars in their first year alone.",
  },
  {
    question: "What does the free discovery call include?",
    answer:
      "The discovery call is a no-obligation conversation where we learn about your current tax situation, business structure, and financial goals. We'll identify potential areas for tax savings and explain how our approach differs from traditional tax preparation. There's no pressure — it's simply an opportunity to see if we're a good fit.",
  },
  {
    question: "Do you replace my current CPA?",
    answer:
      "In many cases, yes. We provide comprehensive tax planning AND preparation services. However, we can also work alongside your existing CPA if you prefer. Our role is to develop and implement the tax strategy, while your CPA can continue handling day-to-day bookkeeping or other services.",
  },
  {
    question: "Is tax planning only for the wealthy?",
    answer:
      "Not at all. While high-income earners and business owners often benefit the most from advanced tax strategies, anyone who feels they're paying too much in taxes can benefit from proactive planning. The key is having enough income or business activity where strategic planning can make a meaningful difference.",
  },
  {
    question: "How do you charge for your services?",
    answer:
      "Our fees are based on the complexity of your situation and the scope of services needed. We believe our services should pay for themselves many times over through tax savings. During your discovery call, we'll provide transparent pricing based on your specific needs. Most clients find that their tax savings far exceed our fees.",
  },
  {
    question: "Do you work with clients nationwide?",
    answer:
      "Yes, we serve clients across the United States. While we have a strong presence in the Midwest, our virtual consultation model allows us to work with business owners and high-income earners anywhere in the country. All of our meetings can be conducted via video call for your convenience.",
  },
];

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
