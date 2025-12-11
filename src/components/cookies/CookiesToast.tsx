'use client';

import { useState } from 'react';
import { LuCookie } from 'react-icons/lu';
import { AiOutlineClose } from 'react-icons/ai';
import Link from 'next/link';




export default function CookiesToast() { 
  const [showModal, setShowModal] = useState(false);
 
 
  

  const handleAgree = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    console.log('Korisnik se slaže sa kolačićima');
    setShowModal(false);
  };
  
  const handleDisagree = () => {
    localStorage.setItem('cookieConsent', 'declined');
    console.log('Korisnik se ne slaže sa kolačićima');
    setShowModal(false);
  };
  

  return (
    <div>
      {/* Dugme za kolačiće */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 left-4 p-3 bg-blue-700 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors"
        aria-label="Cookie settings"
      >
        <LuCookie className="text-xl" />
      </button>

      {/* Modal za kolačiće */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 mx-4">
          <div className="bg-zinc-500 rounded-2xl shadow-lg shadow-cyan-500 border border-cyan-400 p-6 relative max-w-lg w-full">
            {/* Zatvori dugme */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-sky-800 hover:text-neutral-300"
              aria-label="Close modal"
            >
              <AiOutlineClose className="text-xl" />
            </button>

            {/* Sadržaj */}
            <h2 className="text-xl text-zinc-200 font-semibold mb-4">
                Ova stranica koristi kolačiće
            </h2>
            <p className="text-zinc-300 mb-4">
              Koristimo kolačiće za poboljšanje korisničkog iskustva. Više informacija pronađite u našim {' '}
              <Link href={"/privacy"}
               className="text-blue-900 hover:underline">
                Pravila privatnosti
              </Link>{' '}
              i {' '}
              <Link href={"/terms"} 
                className="text-blue-900 hover:underline">
                Uvjeti korištenja
              </Link>{' '}
              stranicama.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDisagree}
                className="px-4 py-2 bg-red-600 text-neutral-200 rounded-2xl hover:bg-neutral-400"
              >
                Ne slažem se
              </button>
              <button
                onClick={handleAgree}
                className="px-4 py-2 bg-blue-700 text-white rounded-2xl hover:bg-blue-600"
              >
                Slažem se
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}