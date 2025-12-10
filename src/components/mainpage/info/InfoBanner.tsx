import { ShineBorder } from "@/components/ui/shine-border";
import { FiPhoneCall, FiTruck, FiShield } from "react-icons/fi";

export default function InfoBanner() {
  return (
    <section className="relative mx-auto my-16 w-full max-w-6xl px-4 md:px-6 lg:px-8">

      {/* 🔹 Heading sekcija sa gradient backgroundom */}
      <div className="mb-8 rounded-3xl border border-cyan-500/10 bg-linear-to-r from-slate-950/50 via-slate-900/20 to-slate-950/50 px-4 py-6 sm:px-6 sm:py-7 shadow-[0_0_40px_rgba(15,23,42,0.8)]">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Zašto kupovati kod nas
          </p>

          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Sigurna kupnja, brza isporuka i pouzdana podrška
          </h2>

          {/* Pulsirajući underline ispod H2 */}
          <div className="mx-auto mt-3 flex justify-center">
            <span className="pulse-underline inline-block h-0.5 w-20 rounded-full bg-cyan-400/80 sm:w-24" />
          </div>

          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
            Fokusirani smo na kvalitet, sigurnost i iskustvo kupaca – sve što vam je potrebno
            na jednom mjestu.
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* 1. Pozovite nas */}
        <div className="relative group">
          <div className="pointer-events-none absolute inset-0 rounded-2xl">
            <ShineBorder
              shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
              duration={14}
              borderWidth={2}
            />
          </div>

          <div className="relative z-10 flex h-full flex-col rounded-2xl bg-slate-900/20 p-4 sm:p-5 backdrop-blur transition 
                          group-hover:bg-slate-900/70 group-hover:shadow-[0_0_30px_rgba(160,124,254,0.45)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15">
                <FiPhoneCall className="text-xl text-cyan-300" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Pozovite nas
                </p>
                <h3 className="text-sm font-semibold text-slate-50">
                  Ponedjeljak – petak
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-200">08:00 – 16:00</p>
            <p className="text-lg font-semibold text-cyan-300">032 442-992</p>

            <p className="mt-3 text-[11px] text-slate-400">
              Brza podrška za pitanja o proizvodima, narudžbi i dostupnosti.
            </p>
          </div>
        </div>

        {/* 2. Brza isporuka */}
        <div className="relative group">
          <div className="pointer-events-none absolute inset-0 rounded-2xl">
            <ShineBorder
              shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
              duration={14}
              borderWidth={2}
            />
          </div>

          <div className="relative z-10 flex h-full flex-col rounded-2xl bg-slate-900/20 p-4 sm:p-5 backdrop-blur transition 
                          group-hover:bg-slate-900/70 group-hover:shadow-[0_0_30px_rgba(52,211,153,0.45)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15">
                <FiTruck className="text-xl text-emerald-300" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Brza isporuka
                </p>
                <h3 className="text-sm font-semibold text-slate-50">
                  Kvaliteta i sigurnost
                </h3>
              </div>
            </div>

            <ul className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-100">
              <li className="rounded-full bg-slate-800/80 px-3 py-1">Kvalitet proizvoda</li>
              <li className="rounded-full bg-slate-800/80 px-3 py-1">Sigurna kupnja</li>
              <li className="rounded-full bg-slate-800/80 px-3 py-1">Povrat novca</li>
            </ul>

            <p className="mt-3 text-[11px] text-slate-400">
              Brza obrada narudžbi uz sigurnu isporuku i jasne uvjete povrata.
            </p>
          </div>
        </div>

        {/* 3. Garancija */}
        <div className="relative group">
          <div className="pointer-events-none absolute inset-0 rounded-2xl">
            <ShineBorder
              shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
              duration={14}
              borderWidth={2}
            />
          </div>

          <div className="relative z-10 flex h-full flex-col rounded-2xl bg-slate-900/20 p-4 sm:p-5 backdrop-blur transition 
                          group-hover:bg-slate-900/70 group-hover:shadow-[0_0_30px_rgba(129,140,248,0.5)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15">
                <FiShield className="text-xl text-indigo-300" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
                  Garancija & podrška
                </p>
                <h3 className="text-sm font-semibold text-slate-50">
                  Pouzdana kupnja
                </h3>
              </div>
            </div>

            <ul className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-100">
              <li className="rounded-full bg-slate-800/80 px-3 py-1">Garancija</li>
              <li className="rounded-full bg-slate-800/80 px-3 py-1">Pouzdanost</li>
              <li className="rounded-full bg-slate-800/80 px-3 py-1">Povoljne cijene</li>
              <li className="rounded-full bg-slate-800/80 px-3 py-1">Korisnička podrška</li>
            </ul>

            <p className="mt-3 text-[11px] text-slate-400">
              Stojimo iza proizvoda i pružamo sigurnost uz profesionalnu korisničku podršku.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}