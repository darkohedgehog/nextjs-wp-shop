'use client';

import { useRef, useState } from 'react';
import { LuCookie } from 'react-icons/lu';
import { AiOutlineClose } from 'react-icons/ai';
import Link from 'next/link';

export default function CookiesToast() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [saved, setSaved] = useState(false);
  function choose(choice: 'accepted' | 'declined') {
    try { localStorage.setItem('cookieConsent', choice); setSaved(true); }
    catch { setSaved(false); }
    dialog.current?.close();
  }
  return (
    <>
      <button onClick={() => dialog.current?.showModal()} className="fixed bottom-4 left-4 p-3 z-40 bg-blue-700 text-white rounded-full shadow-md hover:bg-blue-600" aria-label="Postavke kolačića">
        <LuCookie className="text-xl" />
      </button>
      <span className="sr-only" role="status">{saved ? 'Postavka je spremljena.' : ''}</span>
      {/* Native dialog contains keyboard focus and restores it on close/Escape. */}
      <dialog ref={dialog} aria-labelledby="cookie-title" className="m-auto max-w-lg w-[calc(100%-2rem)] rounded-2xl border border-cyan-400 bg-zinc-900 text-zinc-200 p-6 backdrop:bg-black/60">
        <button onClick={() => dialog.current?.close()} className="absolute top-3 right-3 p-2" aria-label="Zatvori postavke kolačića"><AiOutlineClose /></button>
        <h2 id="cookie-title" className="text-xl font-semibold mb-4 pr-8">Postavke kolačića</h2>
        <p className="mb-4 text-zinc-300">Nužni kolačići omogućuju prijavu i rad trgovine. Ovdje možete spremiti svoj izbor za dodatne kolačiće. Više informacija nalazi se u <Link href="/privacy" className="text-cyan-300 underline">pravilima privatnosti</Link>.</p>
        <div className="flex flex-wrap justify-end gap-3">
          <button onClick={() => choose('declined')} className="px-4 py-2 border border-zinc-500 rounded-xl">Samo nužni</button>
          <button onClick={() => choose('accepted')} className="px-4 py-2 bg-blue-700 rounded-xl">Prihvati dodatne</button>
        </div>
      </dialog>
    </>
  );
}
