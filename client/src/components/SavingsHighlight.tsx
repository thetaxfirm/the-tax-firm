import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function FormattedCounter({ end, duration = 2500 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [hasStarted, end, duration]);

  const formatted = count.toLocaleString("en-US");

  return <span ref={ref}>${formatted}</span>;
}

export default function SavingsHighlight() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" ref={ref}>
      {/* Dark background with gold accent glow */}
      <div className="absolute inset-0 bg-[#0B1120]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D4A853]/5 rounded-full blur-[150px]" />

      <div className="relative container text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[#D4A853] text-xs uppercase tracking-[0.3em] font-medium mb-8">
            The Average Client Saves
          </p>
          <div className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-white mb-6">
            <FormattedCounter end={47500} />
          </div>
          <p className="text-lg sm:text-xl text-[#E8E4DD]/50 max-w-xl mx-auto">
            per year in tax savings through our advanced tax planning strategies
          </p>
        </motion.div>
      </div>
    </section>
  );
}
