import Link from "next/link";
import LottieAboutUs from "./LottieAboutUs";
import { MdOutlinePhoneForwarded } from "react-icons/md";

export default function AboutUs() {
  return (
    <section
      id="about-us"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
        {/* Tekstualni deo */}
        <div className="relative flex-1">
          {/* Subtle glowing frame */}
          <div className="pointer-events-none absolute -inset-0.5 -z-10 rounded-3xl bg-linear-to-br from-emerald-500/40 via-cyan-500/40 to-sky-500/40 opacity-70 blur-xl" />
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_0_40px_rgba(34,211,238,0.18)] backdrop-blur-xl sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.5)]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              O nama
            </div>

            <h1 className="mt-4 text-balance text-2xl font-semibold leading-tight text-cyan-400 sm:text-3xl lg:text-4xl">
              Preporučujemo se u vašem budućem snabdjevanju!
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              Živić elektro je tvrtka za trgovinu i usluge u privatnom vlasništvu
              osnovana 1998 godine u Hrvatskoj. Na tržištu Republike Hrvatske
              nastupamo kao generalni distributeri i uvoznici proizvoda Metalke
              Majur, lidera u proizvodnji elektro galanterije u ovom dijelu Europe.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              U našoj prodajnoj ponudi možete pronaći proizvode iz asortimana firmi
              Nopallux, Tehnoelektro i Elid koji svojom tradicijom kvaliteta
              garantiraju sigurnost, pouzdanost, ljepotu i stil svojih proizvoda.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              U svojoj ponudi vam predstavljamo široku lepezu proizvoda, kao što su:
              utičnice, sklopke, tipkala, utikači i elektro instalacijski pribor.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              Svoju djelatnost ostvarujemo kroz maloprodaju i veleprodaju.
            </p>

            {/* Divider */}
            <div className="mt-6 h-px w-full bg-linear-to-r from-transparent via-slate-500/40 to-transparent" />

            {/* Company details blok */}
            <div className="mt-6 space-y-4 text-sm text-slate-200 sm:text-[0.95rem]">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Podaci o tvrtki
                </h2>
                <p className="mt-2 font-medium text-slate-100">
                  ŽIVIĆ-ELEKTRO j.d.o.o.
                </p>
                <p className="text-slate-300">
                  Sjedište: 204. Vukovarske brigade 39, 32000 Vukovar
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Identifikacija
                  </p>
                  <p className="text-slate-300">
                    MB: <span className="font-medium text-slate-100">2945894</span>
                  </p>
                  <p className="text-slate-300">
                    OIB:{" "}
                    <span className="font-medium text-slate-100">
                      90344764519
                    </span>
                  </p>
                  <p className="text-slate-300">
                    MBS (Trgovački sud Osijek):{" "}
                    <span className="font-medium text-slate-100">
                      030125449
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Poslovni račun
                  </p>
                  <p className="text-slate-300">
                    IBAN:{" "}
                    <span className="font-medium text-slate-100">
                      HR09 2500 0091 1013 8698 0
                    </span>
                  </p>
                  <p className="text-slate-300">
                    Temeljni kapital:{" "}
                    <span className="font-medium text-slate-100">
                      1,00 EUR (uplaćen u cijelosti)
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Pravna forma
                  </p>
                  <p className="text-slate-300">
                    Pravno ustrojbeni oblik:{" "}
                    <span className="font-medium text-slate-100">
                      jednostavno društvo sa ograničenom odgovornošću
                    </span>
                  </p>
                  <p className="text-slate-300">
                    Brojčana oznaka:{" "}
                    <span className="font-medium text-slate-100">49</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Djelatnost
                  </p>
                  <p className="text-slate-300">
                    Djelatnost: brojčana oznaka razreda{" "}
                    <span className="font-medium text-slate-100">4759</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lottie deo */}
        <div className="relative flex-1">
          {/* Glow frame oko animacije */}
          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.25rem] bg-linear-to-tr from-emerald-400/40 via-cyan-400/40 to-sky-400/40 opacity-70 blur-2xl glow-pulse" />
          <div className="relative mx-auto flex max-w-md items-center justify-center rounded-4xl border border-white/10 bg-slate-950/50 p-4 shadow-[0_0_45px_rgba(56,189,248,0.35)] backdrop-blur-xl sm:p-6 lg:max-w-lg">
            <div className="aspect-video w-full">
              <LottieAboutUs />
            </div>
          </div>

          {/* Mali badge ispod animacije */}
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-200 shadow-[0_0_20px_rgba(15,23,42,0.8)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              Vaš partner za elektro materijal od 1998.
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center my-16">
          <Link href='/contact'>
          <button
           type="button"
           className="bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer flex items-center px-4 py-2 rounded-3xl transition border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] gap-2 text-[#007bff] font-semibold">
            Kontakt
            <span><MdOutlinePhoneForwarded className="w-5 h-5" /></span>
          </button>
          </Link>
        </div>
    </section>
  );
}