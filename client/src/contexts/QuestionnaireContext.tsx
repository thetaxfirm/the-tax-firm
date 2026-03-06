import { createContext, useContext, useState, type ReactNode } from "react";

interface QuestionnaireContextType {
  isOpen: boolean;
  openQuestionnaire: () => void;
  closeQuestionnaire: () => void;
}

const QuestionnaireContext = createContext<QuestionnaireContextType | null>(null);

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openQuestionnaire = () => setIsOpen(true);
  const closeQuestionnaire = () => setIsOpen(false);

  return (
    <QuestionnaireContext.Provider value={{ isOpen, openQuestionnaire, closeQuestionnaire }}>
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaire() {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error("useQuestionnaire must be used within a QuestionnaireProvider");
  }
  return context;
}
