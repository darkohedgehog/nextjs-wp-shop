"use client";
import { TypewriterEffectSmooth } from "../../ui/typewriter-effect";

export default function TypewriterEffectHero() {
  const words = [
    {
      text: "Za",
    },
    {
      text: "vaš",
    },
    {
      text: "dom",
    },
    {
      text: "najbolji",
    },
    {
      text: "elektromaterijal.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-[40rem]  ">
      <p className="text-neutral-600 dark:text-neutral-200 text-xl lg:text-4xl md:text-4xl">
        Budi mudar kupuj kvalitetno
      </p>
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        <button className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
          Join now
        </button>
        <button className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm">
          Signup
        </button>
      </div>
    </div>
  );
}
