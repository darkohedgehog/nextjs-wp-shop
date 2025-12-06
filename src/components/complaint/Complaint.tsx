import { MdOutlineAssignment, MdOutlineMarkEmailRead } from "react-icons/md";
import { TbTruckReturn } from "react-icons/tb";
import { FiPhoneCall } from "react-icons/fi";
import Link from "next/link";

export default function Complaint() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* ANIMATED BORDER KARTICA */}
        <div className="animated-border rounded-4xl">
          <div className="animated-border-inner rounded-4xl border border-white/10 bg-slate-950/80 p-6 sm:p-8 lg:p-10 shadow-[0_0_45px_rgba(56,189,248,0.28)] backdrop-blur-xl text-slate-100">
            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.5)]">
                <TbTruckReturn className="h-4 w-4" />
                Povrat robe – reklamacije
              </div>
              <span className="text-xs text-cyan-300">Podrška kupcima</span>
            </div>

            <h1 className="mt-6 text-balance text-2xl font-semibold leading-snug text-slate-50 sm:text-3xl">
              Povrat robe i postupak reklamacija
            </h1>

            {/* UVOD */}
            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
              Povrat robe se vrši najduže u roku{" "}
              <span className="font-semibold text-slate-100">
                8 dana od primitka robe
              </span>
              . Nakon našeg primitka robe i evidencije greške vraćamo iznos
              uplaćen za robu.
            </p>

            {/* ŠTO TREBA NAPISATI U PRIGOVORU */}
            <section className="mt-8">
              <div className="flex items-center gap-3">
                <MdOutlineAssignment className="h-5 w-5 text-cyan-300" />
                <h2 className="text-lg font-semibold text-slate-50">
                  Što navesti u pisanom prigovoru
                </h2>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Molimo da tijekom pisanja prigovora ispunite sljedeće podatke:
              </p>

              <ul className="mt-3 ml-4 list-disc space-y-1 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                <li>Upišite Vaše ime i prezime</li>
                <li>Upišite Vašu e-mail adresu</li>
                <li>Upišite broj i datum narudžbe</li>
                <li>Naziv proizvoda</li>
                <li>Razlog povrata ili reklamacije</li>
                <li>Količinu proizvoda</li>
              </ul>
            </section>

            {/* KONTAKT – MAIL */}
            <section className="mt-8 space-y-3">
              <div className="flex items-center gap-3">
                <MdOutlineMarkEmailRead className="h-5 w-5 text-cyan-300" />
                <h2 className="text-lg font-semibold text-slate-50">
                  Slanje prigovora i reklamacija
                </h2>
              </div>

              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Vaše prigovore i reklamacije možete poslati na:
              </p>

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100 shadow-[0_0_18px_rgba(56,189,248,0.5)]">
                <MdOutlineMarkEmailRead className="h-4 w-4" />
                <a
                  href="mailto:prodaja@zivic-elektro.com"
                  className="underline underline-offset-2 hover:text-cyan-50"
                >
                  prodaja@zivic-elektro.com
                </a>
              </div>
            </section>

            {/* KONTAKT – TELEFON */}
            <section className="mt-8 space-y-3">
              <div className="flex items-center gap-3">
                <FiPhoneCall className="h-5 w-5 text-emerald-300" />
                <h2 className="text-lg font-semibold text-slate-50">
                  Dodatne informacije
                </h2>
              </div>

              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Više informacija možete dobiti pozivom na broj telefona:
              </p>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 shadow-[0_0_18px_rgba(52,211,153,0.5)]">
                <FiPhoneCall className="h-4 w-4" />
                <a
                  href="tel:+38532442992"
                  className="underline underline-offset-2 hover:text-emerald-50"
                >
                  +385 32 442 992
                </a>
              </div>
            </section>
            {/* CTA BUTTON */}
            <div className="mt-10 flex justify-center">
              <Link
                href="/contact"
                className="relative inline-flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 px-6 py-3 
              text-sm font-semibold text-cyan-200 shadow-[0_0_25px_rgba(56,189,248,0.35)] backdrop-blur-xl
              border border-cyan-400/30
              transition duration-200 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(56,189,248,0.55)]"
              >
                Idi na kontakt stranicu
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-cyan-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
