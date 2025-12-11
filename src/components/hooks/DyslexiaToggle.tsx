'use client';

import { useState, useEffect } from 'react';
import { RxAccessibility } from "react-icons/rx";

export default function DyslexiaToggle() {
  const [isDyslexiaFont, setIsDyslexiaFont] = useState(false);

  useEffect(() => {
    if (isDyslexiaFont) {
      document.body.classList.add('dyslexia');
    } else {
      document.body.classList.remove('dyslexia');
    }
  }, [isDyslexiaFont]);

  return (
    <div>
      <button
        onClick={() => setIsDyslexiaFont((prev) => !prev)}
        className={`p-3 border border-[#adb5bd] rounded-full shadow-md transition-colors ${
          isDyslexiaFont ? 'bg-blue-400 hover:bg-blue-300' : 'bg-blue-700 hover:bg-blue-600'
        }`}
        aria-label="Toggle dyslexia-friendly font"
      >
        <RxAccessibility className="text-white text-xl" />
      </button>
    </div>
  );
}