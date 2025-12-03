"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiHelpCircle, FiMessageSquare } from "react-icons/fi";

type FaqItem = {
  question: string;
  answer: string;
};

const faqData: FaqItem[] = [
  {
    question: "Kako funkcioniše vaša usluga savjetovanja?",
    answer:
      "Naš tim analizira vaše potrebe, predlaže najbolje opcije i vodi vas kroz ceo proces od početne ideje do realizacije.",
  },
  {
    question: "Da li nudite podršku nakon završetka projekta?",
    answer:
      "Naravno. Dostupni smo za nadogradnje, optimizaciju i tehničku podršku nakon lansiranja projekta.",
  },
  {
    question: "Koliko traje izrada jednog projekta?",
    answer:
      "Zavisi od kompleksnosti. Manji projekti traju od 1 do 3 nedelje, dok veći sistemi mogu zahtevati više faza razvoja.",
  },
];

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [openAll, setOpenAll] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  const handleToggle = (index: number) => {
    // Ako je bilo "open all", klik na pojedinačno pitanje izlazi iz tog moda
    setOpenAll(false);
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const handleToggleAll = () => {
    if (openAll) {
      // Zatvori sve
      setOpenAll(false);
      setOpenIndex(null);
    } else {
      // Otvori sve
      setOpenAll(true);
      setOpenIndex(null);
    }
  };

  // Scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const totalHeight = rect.height - window.innerHeight;

      if (totalHeight <= 0) {
        setProgress(1);
        return;
      }

      const scrollY = window.innerHeight - rect.top;
      const rawProgress = Math.min(Math.max(scrollY / totalHeight, 0), 1);
      setProgress(rawProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      className="relative max-w-6xl my-16 mx-2 lg:mx-auto md:mx-auto space-y-10"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Scroll progress bar (sticky na vrhu sekcije) */}
      <div className="sticky top-0 left-0 w-full h-1 bg-zinc-900/40 backdrop-blur-md z-30">
        <div
          className="h-1 bg-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.8)] transition-all duration-100 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Naslov */}
      <h2 className="text-center text-3xl md:text-4xl font-semibold secondary-color tracking-tight drop-shadow-[0_2px_10px_rgba(0,255,255,0.25)]">
        Često postavljena pitanja
      </h2>

      {/* Neon divider */}
      <div className="flex justify-center">
        <div className="w-32 h-0.5 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(0,255,255,0.7)]" />
      </div>

      {/* Badge + Collapse/Expand All dugme */}
      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="flex justify-center md:justify-start w-full md:w-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(0,255,255,0.15)] backdrop-blur-md">
            <FiHelpCircle className="w-4 h-4" />
            FAQ
          </span>
        </div>

        <div className="flex justify-center md:justify-end w-full md:w-auto">
          <button
            type="button"
            onClick={handleToggleAll}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 text-xs md:text-sm font-medium text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-400/80 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.15)]"
          >
            {openAll ? "Zatvori sva pitanja" : "Otvori sva pitanja"}
          </button>
        </div>
      </div>

      {/* FAQ lista */}
      <div className="space-y-5">
        {faqData.map((item, index) => {
          const isOpen = openAll || openIndex === index;

          return (
            <motion.div
              key={index}
              className="relative group border border-[#adb5bd]/70 bg-linear-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-800/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.35,
                ease: "easeOut",
                delay: index * 0.05,
              }}
              whileHover={{
                scale: 1.01,
                boxShadow: "0 0 35px rgba(34,211,238,0.4)",
              }}
            >
              {/* Blur shine highlight */}
              <div className="pointer-events-none absolute -top-10 left-0 right-0 h-24 bg-linear-to-b from-cyan-400/40 via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-400" />

              <button
                type="button"
                onClick={() => handleToggle(index)}
                className="relative flex w-full items-center justify-between gap-3 p-5 text-left text-cyan-600"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <FiMessageSquare className="w-5 h-5 text-cyan-500/80" />
                  <h3 className="text-lg font-medium text-cyan-100">
                    {item.question}
                  </h3>
                </div>

                <FiChevronDown
                  className={`size-5 shrink-0 text-cyan-300 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`content-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 text-zinc-200">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Microcopy */}
      <p className="text-center text-sm text-zinc-400/80 mt-6">
        Niste pronašli odgovor koji tražite?{" "}
        <Link
          href="/contact"
          className="text-cyan-300 underline underline-offset-4 cursor-pointer hover:text-cyan-200 transition"
        >
          Kontaktirajte nas
        </Link>{" "}
        i rado ćemo vam pomoći.
      </p>
    </motion.section>
  );
};

export default FaqSection;