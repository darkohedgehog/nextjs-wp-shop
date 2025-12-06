
export default function Terms() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10">
      </div>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* ANIMATED BORDER KARTICA */}
        <div className="animated-border rounded-4xl">
          <div className="animated-border-inner rounded-4xl border border-white/10 bg-slate-950/80 p-6 sm:p-8 lg:p-10 shadow-[0_0_45px_rgba(56,189,248,0.28)] backdrop-blur-xl text-slate-100">
            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.5)]">
                Uvjeti korištenja
              </div>
              <span className="text-xs text-slate-400">
                Zadnje ažuriranje: {new Date().getFullYear()}.
              </span>
            </div>

            <h1 className="mt-6 text-balance text-2xl font-semibold leading-snug text-slate-50 sm:text-3xl">
              Uvjeti kupnje i korištenja web trgovine{" "}
              <span className="text-cyan-300">www.zivic-elektro.shop</span>
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
              Ovi Uvjeti kupnje i uvjeti korištenja primjenjuju se na kupnju
              proizvoda putem web trgovine{" "}
              <span className="font-medium text-slate-100">
                www.zivic-elektro.shop
              </span>{" "}
              i čine sastavni dio ugovornog odnosa između kupca i Živić elektro
              tvrtke.
            </p>

            {/* UVJETI KUPNJE */}
            <section className="mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-cyan-300">
                Uvjeti kupnje
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Putem web trgovine{" "}
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                kupcu je omogućena kupnja svih proizvoda koji se nalaze na
                navedenoj web trgovini.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Cijene su iskazane s uključenim PDV-om.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Valuta plaćanja je EURO (€) od 01.01.2023.
              </p>
            </section>

            {/* NARUČIVANJE */}
            <section className="mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-cyan-300">
                Naručivanje
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Proizvodi se naručuju putem košarice i narudžbe su neopozive.{" "}
                Ukoliko prodavatelj nije u mogućnosti isporučiti sve naručene
                proizvode, isporučit će raspoložive te o tome obavijestiti Kupca
                e-mailom ili telefonom s naznakom isporuke preostalih
                proizvoda.
              </p>
            </section>

            {/* DOSTAVA */}
            <section className="mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-cyan-300">Dostava</h2>

              <h3 className="text-sm font-semibold text-cyan-500">
                Uvjeti dostave
              </h3>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Naručeni proizvod/i dostavljaju se do ulaza u stambeni objekt.{" "}
                Ukoliko se radi o stambenoj zgradi, dostavljač nije obvezan
                nositi proizvod/e do kata na kojem se nalazi kupac, već do
                ulaza u zgradu. Proizvod/i se dostavljaju na području cijele
                Republike Hrvatske.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Cijena dostave je fiksna i iznosi{" "}
                <span className="font-medium text-slate-100">5,50 €</span>.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Vrijeme dostave je do{" "}
                <span className="font-medium text-slate-100">
                  7 radnih dana
                </span>{" "}
                (osim otoci). Zbog specifičnosti dostave, točan termin dostave
                paketa na otoke možete saznati prilikom narudžbe. Ukoliko želite
                nešto napomenuti, molimo navedite to pod “napomena” prilikom
                naručivanja.
              </p>

              <h3 className="mt-4 text-sm font-semibold text-cyan-500">
                Ostali uvjeti dostave
              </h3>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Proizvodi će biti zapakirani tako da se uobičajenom
                manipulacijom u transportu ne mogu oštetiti. Kupac je dužan
                prilikom preuzimanja proizvoda provjeriti eventualna oštećenja i
                odmah ih reklamirati dostavnom radniku koji je robu dostavio,
                odnosno odbiti preuzeti pošiljku na kojoj su vidljiva vanjska
                oštećenja.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Kupac je obavezan prilikom preuzimanja proizvoda potpisati
                otpremnicu te je kurirska služba uzima kao potvrdu o
                preuzimanju.
              </p>
            </section>

            {/* PLAĆANJE */}
            <section className="mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-cyan-300">Plaćanje</h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Naručene proizvode s troškovima dostave Kupac će Prodavatelju
                platiti pouzećem prilikom dostave proizvoda, uplatom na
                Prodavateljev žiro-račun ili karticom.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                U slučaju da Kupac naruči proizvode i odbije ih primiti,
                Prodavatelj ima pravo tražiti od Kupca nadoknadu poštanskih i
                vlastitih manipulativnih troškova.
              </p>
            </section>

            {/* POVRAT / REKLAMACIJE */}
            <section className="mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-cyan-300">
                Povrat / Reklamacije
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Kupac ima pravo na povrat proizvoda u sljedećim slučajevima:
              </p>
              <ul className="ml-4 list-disc space-y-1 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                <li>isporuka proizvoda koji nisu naručeni</li>
                <li>
                  isporuka proizvoda koji ima grešku ili oštećenja koja nisu
                  nastala u transportu
                </li>
                <li>ostali slučajevi sukladno zakonskim okvirima</li>
              </ul>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Prodavatelj će odobriti povrat proizvoda Kupcu nakon prijema
                opravdane reklamacije e-mailom ili telefonski s instrukcijama za
                povrat proizvoda.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                U slučaju povrata proizvoda koji nije nastao propustom
                Prodavatelja, Kupac snosi sve manipulativne troškove koji su
                nastali. Povrat robe se vrši najduže u roku{" "}
                <span className="font-medium text-slate-100">
                  8 dana od primitka robe
                </span>
                . Nakon primitka povratne robe i evidencije greške, vraćamo
                iznos uplaćen za robu.
              </p>
            </section>

            {/* NEWSLETTER */}
            <section className="mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-cyan-300">
                Newsletter
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Prilikom registracije na{" "}
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                web trgovinu svaki korisnik se automatski prijavljuje na
                newsletter.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Moguće je opozvati dolazak newslettera na način da, kada se
                primi prvi newsletter, kliknete na poveznicu „ovdje se odjavi sa
                newsletter-a“.
              </p>
            </section>

            {/* IZMJENE UVJETA + KONTAKT */}
            <section className="mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-cyan-300">
                Izmjene uvjeta i kontakt
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                ima pravo u svakom trenutku izmijeniti ili dopuniti sadržaj
                Internet trgovine, kao i ove Uvjete kupnje.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Za sva dodatna pitanja slobodno nas kontaktirajte putem
                e-maila:{" "}
                <a
                  href="mailto:prodaja@zivic-elektro.com"
                  className="font-medium text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                >
                  prodaja@zivic-elektro.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}