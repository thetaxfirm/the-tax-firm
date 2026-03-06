/*
 * Design: Midnight Boardroom — Dark Luxury Advisory
 * Colors: #0B1120 (midnight), #D4A853 (gold), #E8E4DD (ivory text)
 * Fonts: DM Serif Display (headings), DM Sans (body)
 * Multi-step questionnaire modal with inline Calendly embed after completion.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, X, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface QuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
}

type Answer = string | boolean | null;

interface QuestionConfig {
  id: string;
  question: string;
  type: "yesno" | "text" | "textarea" | "email" | "phone" | "name";
  placeholder?: string;
  prefix?: string;
}

const questions: QuestionConfig[] = [
  {
    id: "name",
    question: "What is your full name?",
    type: "name",
    placeholder: "John Smith",
  },
  {
    id: "email",
    question: "What is your email address?",
    type: "email",
    placeholder: "you@example.com",
  },
  {
    id: "phone",
    question: "What is your phone number?",
    type: "phone",
    placeholder: "(702) 555-1234",
  },
  {
    id: "self_employed",
    question: "Are you self-employed?",
    type: "yesno",
  },
  {
    id: "w2_employee",
    question: "Are you a W-2 employee?",
    type: "yesno",
  },
  {
    id: "annual_income",
    question: "What is your estimated combined annual income?",
    type: "text",
    placeholder: "e.g. $250,000",
    prefix: "$",
  },
  {
    id: "own_real_estate",
    question: "Do you own any real estate?",
    type: "yesno",
  },
  {
    id: "roth_conversion",
    question: "Are you interested in learning about a ROTH Conversion?",
    type: "yesno",
  },
  {
    id: "pretax_retirement",
    question: "How much pre-tax retirement income do you have saved up?",
    type: "text",
    placeholder: "e.g. $500,000",
    prefix: "$",
  },
  {
    id: "expectations",
    question: "If you were to hire my firm, what are your expectations and what would you want us to accomplish for you or your family?",
    type: "textarea",
    placeholder: "Tell us about your goals, expectations, and what you'd like us to help you achieve...",
  },
];

const CALENDLY_URL = "https://calendly.com/chriscraig702";

export default function Questionnaire({ isOpen, onClose }: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [direction, setDirection] = useState(1);
  const [completed, setCompleted] = useState(false);
  const calendlyContainerRef = useRef<HTMLDivElement>(null);

  const current = questions[currentStep];
  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const submitMutation = trpc.questionnaire.submit.useMutation();

  // Initialize Calendly inline widget when completed
  useEffect(() => {
    if (completed && calendlyContainerRef.current) {
      // Clear any previous widget
      calendlyContainerRef.current.innerHTML = "";

      // Small delay to ensure DOM is ready and Calendly script is loaded
      const timer = setTimeout(() => {
        if (
          calendlyContainerRef.current &&
          (window as any).Calendly
        ) {
          (window as any).Calendly.initInlineWidget({
            url: CALENDLY_URL + "?hide_gdpr_banner=1&background_color=0b1120&text_color=e8e4dd&primary_color=d4a853",
            parentElement: calendlyContainerRef.current,
          });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [completed]);

  const canProceed = () => {
    const answer = answers[current.id];
    if (current.type === "yesno") return answer === true || answer === false;
    if (current.type === "name") {
      const nameStr = String(answer || "").trim();
      return nameStr.length >= 2;
    }
    if (current.type === "email") {
      const emailStr = String(answer || "").trim();
      return emailStr.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
    }
    if (current.type === "phone") {
      const phoneStr = String(answer || "").replace(/[^0-9]/g, "");
      return phoneStr.length >= 7;
    }
    if (current.type === "text" || current.type === "textarea")
      return answer && String(answer).trim().length > 0;
    return false;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      // Submit answers to the database
      submitMutation.mutate({
        name: String(answers["name"] || "").trim(),
        email: String(answers["email"] || "").trim(),
        phone: String(answers["phone"] || "").trim(),
        selfEmployed: answers["self_employed"] === true,
        w2Employee: answers["w2_employee"] === true,
        annualIncome: String(answers["annual_income"] || ""),
        ownsRealEstate: answers["own_real_estate"] === true,
        rothConversionInterest: answers["roth_conversion"] === true,
        retirementSavings: String(answers["pretax_retirement"] || ""),
        expectations: answers["expectations"] ? String(answers["expectations"]) : undefined,
      });
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleYesNo = (value: boolean) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const handleTextChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue) {
      const formatted = Number(numericValue).toLocaleString("en-US");
      setAnswers((prev) => ({ ...prev, [current.id]: formatted }));
    } else {
      setAnswers((prev) => ({ ...prev, [current.id]: "" }));
    }
  };

  const handleTextareaChange = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setDirection(1);
    setCompleted(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't submit on Enter for textarea (allow newlines)
    if (e.key === "Enter" && current.type !== "textarea" && canProceed()) {
      handleNext();
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal — wider when showing Calendly */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className={`relative bg-[#0B1120] border border-[#D4A853]/20 rounded-sm shadow-2xl shadow-black/40 overflow-hidden transition-all duration-500 ${
          completed
            ? "w-full max-w-3xl max-h-[90vh]"
            : "w-full max-w-lg"
        }`}
        onKeyDown={handleKeyDown}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-[#E8E4DD]/40 hover:text-[#D4A853] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Progress bar */}
        {!completed && (
          <div className="h-1 bg-[#0F1729]">
            <motion.div
              className="h-full bg-[#D4A853]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        )}

        {!completed ? (
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="mb-2">
              <span className="text-[#D4A853] text-xs uppercase tracking-[0.3em] font-medium">
                Question {currentStep + 1} of {totalSteps}
              </span>
            </div>

            {/* Question area */}
            <div className="min-h-[200px] flex flex-col justify-center">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <h3 className="font-serif text-2xl sm:text-3xl text-white leading-snug mb-8">
                    {current.question}
                  </h3>

                  {current.type === "yesno" && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleYesNo(true)}
                        className={`flex-1 py-4 rounded-sm text-base font-semibold transition-all duration-300 border ${
                          answers[current.id] === true
                            ? "bg-[#D4A853] text-[#0B1120] border-[#D4A853]"
                            : "bg-transparent text-[#E8E4DD]/60 border-[#D4A853]/20 hover:border-[#D4A853]/50 hover:text-white"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleYesNo(false)}
                        className={`flex-1 py-4 rounded-sm text-base font-semibold transition-all duration-300 border ${
                          answers[current.id] === false
                            ? "bg-[#D4A853] text-[#0B1120] border-[#D4A853]"
                            : "bg-transparent text-[#E8E4DD]/60 border-[#D4A853]/20 hover:border-[#D4A853]/50 hover:text-white"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  )}

                  {current.type === "name" && (
                    <div className="relative">
                      <input
                        type="text"
                        value={String(answers[current.id] || "")}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [current.id]: e.target.value }))}
                        placeholder={current.placeholder}
                        autoFocus
                        className="w-full bg-[#0F1729] border border-[#D4A853]/20 rounded-sm py-4 px-4 text-white text-lg focus:border-[#D4A853]/50 focus:outline-none transition-colors placeholder:text-[#E8E4DD]/20"
                      />
                    </div>
                  )}

                  {current.type === "email" && (
                    <div className="relative">
                      <input
                        type="email"
                        value={String(answers[current.id] || "")}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [current.id]: e.target.value }))}
                        placeholder={current.placeholder}
                        autoFocus
                        className="w-full bg-[#0F1729] border border-[#D4A853]/20 rounded-sm py-4 px-4 text-white text-lg focus:border-[#D4A853]/50 focus:outline-none transition-colors placeholder:text-[#E8E4DD]/20"
                      />
                    </div>
                  )}

                  {current.type === "phone" && (
                    <div className="relative">
                      <input
                        type="tel"
                        value={String(answers[current.id] || "")}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [current.id]: e.target.value }))}
                        placeholder={current.placeholder}
                        autoFocus
                        className="w-full bg-[#0F1729] border border-[#D4A853]/20 rounded-sm py-4 px-4 text-white text-lg focus:border-[#D4A853]/50 focus:outline-none transition-colors placeholder:text-[#E8E4DD]/20"
                      />
                    </div>
                  )}

                  {current.type === "text" && (
                    <div className="relative">
                      {current.prefix && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A853] text-lg font-medium">
                          {current.prefix}
                        </span>
                      )}
                      <input
                        type="text"
                        value={String(answers[current.id] || "")}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder={current.placeholder}
                        autoFocus
                        className={`w-full bg-[#0F1729] border border-[#D4A853]/20 rounded-sm py-4 pr-4 text-white text-lg focus:border-[#D4A853]/50 focus:outline-none transition-colors placeholder:text-[#E8E4DD]/20 ${
                          current.prefix ? "pl-10" : "pl-4"
                        }`}
                      />
                    </div>
                  )}

                  {current.type === "textarea" && (
                    <div className="relative">
                      <textarea
                        value={String(answers[current.id] || "")}
                        onChange={(e) => handleTextareaChange(e.target.value)}
                        placeholder={current.placeholder}
                        autoFocus
                        rows={5}
                        className="w-full bg-[#0F1729] border border-[#D4A853]/20 rounded-sm py-4 px-4 text-white text-base leading-relaxed focus:border-[#D4A853]/50 focus:outline-none transition-colors placeholder:text-[#E8E4DD]/20 resize-none"
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#D4A853]/10">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  currentStep === 0
                    ? "text-[#E8E4DD]/20 cursor-not-allowed"
                    : "text-[#E8E4DD]/60 hover:text-[#D4A853]"
                }`}
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-semibold transition-all duration-300 ${
                  canProceed()
                    ? "bg-[#D4A853] text-[#0B1120] hover:bg-[#F0D68A]"
                    : "bg-[#D4A853]/20 text-[#D4A853]/40 cursor-not-allowed"
                }`}
              >
                {currentStep === totalSteps - 1 ? "Complete" : "Next"}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Completion screen with inline Calendly */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col overflow-hidden"
          >
            {/* Header section */}
            <div className="text-center px-8 pt-8 pb-4">
              <div className="w-14 h-14 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-[#D4A853]" />
              </div>
              <h3 className="font-serif text-2xl text-white mb-2">
                You're All Set!
              </h3>
              <p className="text-[#E8E4DD]/50 text-sm max-w-md mx-auto">
                Pick a time below that works for you and we'll discuss how to reduce your tax burden.
              </p>
            </div>

            {/* Calendly inline embed */}
            <div
              ref={calendlyContainerRef}
              className="w-full overflow-y-auto"
              style={{ minHeight: "580px", height: "calc(90vh - 180px)" }}
            />

            {/* Maybe later link */}
            <div className="text-center py-3 border-t border-[#D4A853]/10">
              <button
                onClick={handleClose}
                className="text-xs text-[#E8E4DD]/30 hover:text-[#D4A853] transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
