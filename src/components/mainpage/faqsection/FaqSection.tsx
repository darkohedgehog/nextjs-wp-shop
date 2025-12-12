"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiHelpCircle, FiMessageSquare } from "react-icons/fi";

export type FaqItem = {
  question: string;
  answer: string; // HTML from WordPress
};

type FaqSectionProps = {
  items?: FaqItem[]; // ✅ allow undefined
};

const FaqSection: React.FC<FaqSectionProps> = ({ items = [] }) => {
  // ✅ normalize - never trust input
  const safeItems = Array.isArray(items) ? items : [];

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [openAll, setOpenAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  const handleToggle = (index: number) => {
    setOpenAll(false);
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const toggleAll = () => {
    setOpenAll((prev) => !prev);
    setOpenIndex(null);
  };

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const total = rect.height - window.innerHeight;

      if (total <= 0) {
        setProgress(1);
        return;
      }

      const current = window.innerHeight - rect.top;
      setProgress(Math.min(Math.max(current / total, 0), 1));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // ✅ set initial progress (optional)
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ guard
  if (safeItems.length === 0) return null;

  return (
    <motion.section
      ref={sectionRef}
      className="relative max-w-6xl mx-2 my-16 space-y-10 lg:mx-auto"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Progress bar */}
      <div className="sticky top-0 z-30 h-1 w-full bg-zinc-900/40">
        <div
          className="h-1 bg-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.7)]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Title */}
      <h2 className="text-center text-3xl font-semibold text-cyan-500 md:text-4xl">
        Često postavljena pitanja
      </h2>

      {/* Divider */}
      <div className="flex justify-center">
        <div className="h-0.5 w-32 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(0,255,255,0.7)]" />
      </div>

      {/* Badge + Toggle all */}
      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-400 backdrop-blur-md">
          <FiHelpCircle /> FAQ
        </span>

        <button
          type="button"
          onClick={toggleAll}
          className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-200 hover:bg-cyan-500/20 transition"
        >
          {openAll ? "Zatvori sva pitanja" : "Otvori sva pitanja"}
        </button>
      </div>

      {/* FAQ items */}
      <div className="space-y-5">
        {safeItems.map((item, index) => {
          const isOpen = openAll || openIndex === index;

          return (
            <motion.div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-zinc-700/70 bg-linear-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-800/80 backdrop-blur-md"
              whileHover={{
                scale: 1.01,
                boxShadow: "0 0 35px rgba(34,211,238,0.4)",
              }}
            >
              {/* Shine */}
              <div className="pointer-events-none absolute -top-10 left-0 right-0 h-24 bg-linear-to-b from-cyan-400/40 via-cyan-400/10 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />

              <button
                type="button"
                onClick={() => handleToggle(index)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${index}`}
              >
                <div className="flex items-center gap-3 text-cyan-200">
                  <FiMessageSquare />
                  <span className="text-lg font-medium">{item.question}</span>
                </div>

                <FiChevronDown
                  className={`text-cyan-200 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`content-${index}`}
                    id={`faq-panel-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="prose prose-invert max-w-none px-5 pb-5 text-cyan-500"
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Microcopy */}
      <p className="text-center text-sm text-zinc-400">
        Niste pronašli odgovor?{" "}
        <Link
          href="/contact"
          className="text-cyan-300 underline hover:text-cyan-200"
        >
          Kontaktirajte nas
        </Link>
      </p>
    </motion.section>
  );
};

export default FaqSection;