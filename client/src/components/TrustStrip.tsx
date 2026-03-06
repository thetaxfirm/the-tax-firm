import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Award, Users, Clock } from "lucide-react";

const trustItems = [
  { icon: Star, label: "5-Star Rated", sublabel: "Client Reviews" },
  { icon: Award, label: "Licensed & Insured", sublabel: "Nationwide" },
  { icon: Users, label: "500+ Clients", sublabel: "Served Nationwide" },
  { icon: Clock, label: "Year-Round", sublabel: "Tax Planning" },
];

export default function TrustStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="relative py-6 bg-[#0B1120] border-y border-[#D4A853]/10" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16"
        >
          {trustItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <item.icon size={20} className="text-[#D4A853]" />
              <div>
                <div className="text-sm font-semibold text-white">{item.label}</div>
                <div className="text-xs text-[#E8E4DD]/40">{item.sublabel}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
