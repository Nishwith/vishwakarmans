import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Home, Palette, DollarSign, Calendar, MessageSquare, Loader2 } from "lucide-react";

const steps = [
  { id: 1, title: "Project Scope", icon: Home },
  { id: 2, title: "Preferred Style", icon: Palette },
  { id: 3, title: "Budget Range", icon: DollarSign },
  { id: 4, title: "Timeline", icon: Calendar },
  { id: 5, title: "Final Details", icon: MessageSquare },
];

const scopes = ["Full Home", "Living Room", "Kitchen", "Bedroom", "Bathroom", "Commercial / Office"];
const styles = ["Modern", "Minimalist", "Traditional", "Bohemian", "Industrial", "Eclectic"];
const budgets = ["Under ₹5 Lakhs", "₹5L - ₹15L", "₹15L - ₹30L", "₹30L+"];
const timelines = ["ASAP", "Within 1 Month", "1-3 Months", "Just Exploring"];

const LeadWizardModal = ({ isOpen, onClose, onSubmit, isSubmitting, designerName }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    scope: "",
    style: "",
    budget: "",
    timeline: "",
    message: "",
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };
  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    if (currentStep === 1) return formData.scope !== "";
    if (currentStep === 2) return formData.style !== "";
    if (currentStep === 3) return formData.budget !== "";
    if (currentStep === 4) return formData.timeline !== "";
    return true; // Step 5 message is optional
  };

  const handleComplete = () => {
    onSubmit(formData);
  };

  // Animation variants
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Project Brief</h2>
            <p className="text-sm text-gray-500 mt-1">
              Share details with <span className="font-bold">{designerName}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 bg-white rounded-full border border-gray-200 shadow-sm transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5 shrink-0">
          <motion.div
            className="h-full bg-brand-accent"
            initial={{ width: "20%" }}
            animate={{ width: `${(currentStep / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </div>

        {/* Content Area */}
        <div className="p-8 flex-1 overflow-y-auto relative min-h-[360px]">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={currentStep}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 p-8"
            >
              {/* Step 1: Scope */}
              {currentStep === 1 && (
                <div className="h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Home className="text-brand-accent" /> What needs designing?
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 content-start">
                    {scopes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setFormData({ ...formData, scope: s })}
                        className={`p-4 rounded-xl text-sm font-bold border-2 transition-all text-left ${
                          formData.scope === s
                            ? "border-brand-accent bg-brand-accent/5 text-brand-accent shadow-md scale-105"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:scale-105"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Style */}
              {currentStep === 2 && (
                <div className="h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Palette className="text-brand-accent" /> What's your style?
                  </h3>
                  <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                    {styles.map((s) => (
                      <button
                        key={s}
                        onClick={() => setFormData({ ...formData, style: s })}
                        className={`p-4 rounded-xl text-center font-bold border-2 transition-all ${
                          formData.style === s
                            ? "border-brand-accent bg-brand-accent/5 text-brand-accent shadow-md scale-105"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:scale-105"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Budget */}
              {currentStep === 3 && (
                <div className="h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <DollarSign className="text-brand-accent" /> Estimated Budget?
                  </h3>
                  <div className="flex flex-col gap-3 flex-1 justify-center">
                    {budgets.map((b) => (
                      <button
                        key={b}
                        onClick={() => setFormData({ ...formData, budget: b })}
                        className={`p-4 rounded-xl text-left font-bold border-2 transition-all ${
                          formData.budget === b
                            ? "border-brand-accent bg-brand-accent/5 text-brand-accent shadow-md scale-100"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 scale-100"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Timeline */}
              {currentStep === 4 && (
                <div className="h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Calendar className="text-brand-accent" /> Project Timeline?
                  </h3>
                  <div className="grid grid-cols-2 gap-4 flex-1 content-center">
                    {timelines.map((t) => (
                      <button
                        key={t}
                        onClick={() => setFormData({ ...formData, timeline: t })}
                        className={`p-4 rounded-xl text-center font-bold border-2 transition-all ${
                          formData.timeline === t
                            ? "border-brand-accent bg-brand-accent/5 text-brand-accent shadow-md scale-105"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:scale-105"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Final Details */}
              {currentStep === 5 && (
                <div className="h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <MessageSquare className="text-brand-accent" /> Final message
                  </h3>
                  <p className="text-gray-500 mb-4 text-sm">
                    Tell the designer a bit more about your vision (optional but recommended).
                  </p>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="E.g., We just bought a new apartment and want a complete overhaul of the living and kitchen area..."
                    className="w-full h-40 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none resize-none transition-all"
                  ></textarea>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              onClick={handlePrev}
              disabled={isSubmitting}
              className="flex items-center gap-2 text-gray-600 font-bold hover:text-gray-900 transition-colors px-4 py-2"
            >
              <ChevronLeft size={20} /> Back
            </button>
          ) : (
            <div /> // Placeholder for space-between 
          )}

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-brand-accent text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin" size={20} /> Sending...</>
              ) : (
                "Submit Inquiry"
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LeadWizardModal;
