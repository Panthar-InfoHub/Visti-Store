"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-start justify-between gap-4 text-left hover:bg-gray-50 transition-colors px-6 -mx-6"
      >
        <span className="font-semibold text-gray-900 text-base md:text-lg pr-8">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 pb-6" : "max-h-0"
        }`}
      >
        <p className="text-gray-600 leading-relaxed text-base">{answer}</p>
      </div>
    </div>
  );
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold text-cyan-600 uppercase tracking-wider mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Find answers to common questions about our products and services
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 divide-y divide-gray-200 p-6 md:p-8 shadow-md">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
