import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useQuestionnaire } from "@/contexts/QuestionnaireContext";

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const { openQuestionnaire } = useQuestionnaire();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thank you for subscribing! We'll be in touch.");
      setEmail("");
    }
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 section-dark overflow-hidden" ref={ref}>
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4A853]/3 rounded-full blur-[250px]" />

      <div className="relative container">
        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#D4A853]" />
            <span className="text-[#D4A853] text-xs uppercase tracking-[0.3em] font-medium">
              Take The First Step
            </span>
            <div className="h-px w-12 bg-[#D4A853]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
            Ready to Stop Overpaying <br className="hidden sm:block" />
            <span className="text-[#D4A853]">the IRS?</span>
          </h2>
          <p className="text-lg text-[#E8E4DD]/60 max-w-2xl mx-auto mb-10">
            Schedule your free discovery call today and find out how much you could be saving with a proactive tax strategy.
          </p>
          <button
            onClick={openQuestionnaire}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-[#D4A853] text-[#0B1120] font-semibold text-lg rounded-sm hover:bg-[#F0D68A] transition-all duration-300 shadow-lg shadow-[#D4A853]/20"
          >
            Schedule a Free Discovery Call
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Newsletter + Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto"
        >
          {/* Newsletter */}
          <div className="glass-card rounded-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail size={20} className="text-[#D4A853]" />
              <h3 className="font-serif text-xl text-white">Stay in the Loop</h3>
            </div>
            <p className="text-sm text-[#E8E4DD]/50 mb-6">
              Get exclusive tax tips, strategy insights, and updates delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletter} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-[#0F1729] border border-[#D4A853]/20 rounded-sm px-4 py-3 text-white placeholder:text-[#E8E4DD]/30 focus:border-[#D4A853]/50 focus:outline-none transition-colors"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-all duration-300 text-sm"
              >
                Subscribe to Newsletter
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="glass-card rounded-sm p-8">
            <h3 className="font-serif text-xl text-white mb-6">Get In Touch</h3>
            <div className="space-y-5">
              <button
                onClick={openQuestionnaire}
                className="flex items-center gap-4 text-[#E8E4DD]/60 hover:text-[#D4A853] transition-colors group w-full text-left"
              >
                <div className="w-10 h-10 rounded-sm bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center group-hover:bg-[#D4A853]/20 transition-colors">
                  <Phone size={18} className="text-[#D4A853]" />
                </div>
                <div>
                  <div className="text-xs text-[#E8E4DD]/40 uppercase tracking-wider">Phone</div>
                  <div className="text-sm">Schedule a Call Online</div>
                </div>
              </button>
              <a
                href="mailto:chris@thetaxfirm.us"
                className="flex items-center gap-4 text-[#E8E4DD]/60 hover:text-[#D4A853] transition-colors group"
              >
                <div className="w-10 h-10 rounded-sm bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center group-hover:bg-[#D4A853]/20 transition-colors">
                  <Mail size={18} className="text-[#D4A853]" />
                </div>
                <div>
                  <div className="text-xs text-[#E8E4DD]/40 uppercase tracking-wider">Email</div>
                  <div className="text-sm">chris@thetaxfirm.us</div>
                </div>
              </a>
              <div className="flex items-center gap-4 text-[#E8E4DD]/60">
                <div className="w-10 h-10 rounded-sm bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center">
                  <MapPin size={18} className="text-[#D4A853]" />
                </div>
                <div>
                  <div className="text-xs text-[#E8E4DD]/40 uppercase tracking-wider">Service Area</div>
                  <div className="text-sm">Nationwide — Virtual Consultations</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
