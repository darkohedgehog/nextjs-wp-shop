"use client";

import Image from "next/image";
import Link from "next/link";
import { FiFacebook } from "react-icons/fi";
import { RiMessengerLine, RiLinkedinBoxFill } from "react-icons/ri";
import { MdOutlineAlternateEmail } from "react-icons/md";

export default function ContactUs() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* GRID: IMAGE + INFO */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-16">
          {/* LEFT IMAGE – ista visina kao info blok + pulsing glow */}
          <div className="relative flex-1 animated-border">
            {/* Pulsirajući glow iza slike */}
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-4xl bg-linear-to-br from-emerald-400/40 via-cyan-400/40 to-blue-500/40 blur-2xl glow-pulse-img" />

            <div className="h-full overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80 shadow-[0_0_45px_rgba(56,189,248,0.28)] backdrop-blur-xl flex">
              <Image
                src="https://wp.zivic-elektro.shop/wp-content/uploads/2025/12/contact_us.png"
                alt="Kontakt Živić Elektro"
                width={900}
                height={700}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* RIGHT INFORMATION BLOCK – iste dimenzije kao slika + animated border */}
          <div className="relative flex-1">
            <div className="h-full animated-border">
              <div className="h-full animated-border-inner border border-white/10 bg-slate-950/80 p-8 shadow-[0_0_40px_rgba(56,189,248,0.25)] backdrop-blur-xl flex flex-col rounded-4xl">
                {/* TITLE */}
                <div className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.5)] text-center">
                  Kontakt
                </div>

                <h2 className="mt-4 text-3xl font-semibold text-cyan-400">
                  Uvijek smo tu za vas
                </h2>

                {/* INFO */}
                <div className="mt-6 space-y-6 text-slate-200">
                  <div>
                    <h3 className="text-sm font-semibold text-cyan-300">Naša adresa</h3>
                    <p className="mt-2 text-slate-100">
                      Maloprodaja: Lokvanjski sokak 6, Vukovar
                    </p>
                    <p className="text-slate-100">
                      Veleprodaja: Županijska 21, Vukovar
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-cyan-300">Radno vrijeme</h3>
                    <p className="mt-2 text-slate-100">
                      Ponedjeljak - Petak: 07:30h - 19:30h
                    </p>
                    <p className="text-slate-100">Subota: 07:30h - 13:00h</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-cyan-300">Kontakt</h3>
                    <p className="mt-2 text-slate-100">
                      Email: prodaja@zivic-elektro.com
                    </p>
                    <p className="text-slate-100">Telefon: +385 32 442-992</p>
                  </div>
                </div>

                {/* SOCIAL ICONS */}
                <div className="mt-auto flex flex-col items-center pt-10">
                  <h3 className="mb-4 text-sm font-semibold text-cyan-400">
                    Budimo u kontaktu
                  </h3>

                  <div className="flex items-center gap-4 text-blue-600">
                    <Link
                      href="https://www.facebook.com/?locale=hr_HR"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FiFacebook className="h-6 w-6 transition hover:scale-110" />
                    </Link>

                    <Link
                      href="https://business.facebook.com/latest/inbox/messenger?asset_id=137597493551735&business_id=1133499703746344"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <RiMessengerLine className="h-6 w-6 transition hover:scale-110" />
                    </Link>

                    <Link
                      href="mailto:prodaja@zivic-elektro.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MdOutlineAlternateEmail className="h-6 w-6 transition hover:scale-110" />
                    </Link>

                    <Link
                      href="https://www.linkedin.com/in/darko-%C5%BEivi%C4%87/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <RiLinkedinBoxFill className="h-6 w-6 transition hover:scale-110" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GOOGLE MAP */}
        <div className="relative mt-16">
          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-4xl bg-linear-to-br from-cyan-400/30 via-emerald-400/30 to-blue-400/30 opacity-70 blur-2xl" />

          <div className="overflow-hidden rounded-4xl border border-white/10 bg-slate-950/60 shadow-[0_0_40px_rgba(56,189,248,0.25)] backdrop-blur-xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4831.210175285545!2d18.997743266709854!3d45.35279852954131!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475c8fb963e34a33%3A0x1b603b27797e96a2!2sUl.%20Lokvanjski%20sokak%206%2C%2032000%2C%20Vukovar!5e0!3m2!1shr!2hr!4v1712951137165!5m2!1hr!2hr"
              width="100%"
              height="450"
              loading="lazy"
              className="w-full rounded-4xl border-none"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}