
export default function Privacy() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* ANIMATED BORDER KARTICA */}
        <div className="animated-border rounded-4xl">
          <div className="animated-border-inner rounded-4xl border border-white/10 bg-slate-950/80 p-6 sm:p-8 lg:p-10 shadow-[0_0_45px_rgba(56,189,248,0.28)] backdrop-blur-xl text-slate-100">
            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-cyan-200 shadow-[0_0_18px_rgba(56,189,248,0.5)]">
                Pravila privatnosti
              </div>
              <span className="text-xs text-slate-400">
                Zadnje ažuriranje: {new Date().getFullYear()}.
              </span>
            </div>

            <h1 className="mt-6 text-balance text-2xl font-semibold leading-snug text-slate-50 sm:text-3xl">
              Pravila privatnosti i uvjeti korištenja web trgovine{" "}
              <span className="text-cyan-300">www.zivic-elektro.shop</span>
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
              ŽIVIĆ- ELEKTRO j.d.o.o. Vukovar poštuje privatnost svojih
              korisnika i posjetitelja web stranica. Podatke registriranih
              korisnika, te ostale podatke o korisniku, ŽIVIĆ- ELEKTRO j.d.o.o.
              Vukovar neće davati na uvid trećoj strani. Podaci o korisniku
              neće biti dostupni trećoj strani osim u slučaju kada je takva
              obaveza regulirana zakonom.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
              ŽIVIĆ- ELEKTRO j.d.o.o. Vukovar se obavezuje da će čuvati
              privatnost korisnika web stranica, osim u slučaju teškog kršenja
              pravila ili nezakonitih aktivnosti korisnika.
            </p>

            {/* REGISTRIRANI KORISNICI */}
            <section className="mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-cyan-300">
                Registrirani korisnici
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Registrirani korisnik webshopa ŽIVIĆ- ELEKTRO j.d.o.o. Vukovar
                može biti samo korisnik koji posjeduje korisničko ime i lozinku.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                ŽIVIĆ- ELEKTRO j.d.o.o. Vukovar ne može se držati odgovornim za
                neovlašteno korištenje korisničkog računa, niti eventualnu
                štetu nastalu na taj način.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                ŽIVIĆ- ELEKTRO j.d.o.o. Vukovar zadržava pravo ukinuti ili
                uskratiti mogućnost korištenja korisničkog računa bez
                prethodne najave ili/i objašnjenja.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                ŽIVIĆ- ELEKTRO j.d.o.o. Vukovar ne snosi odgovornost za štetu
                nastalu ukidanjem korisničkog računa.
              </p>
            </section>

            {/* IZJAVA O ZAŠTITI I OSOBNIM PODACIMA */}
            <section className="mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-cyan-300">
                Izjava o zaštiti i prikupljanju osobnih podataka i njihovom
                korištenju te “kolačića”
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Osobni podaci su svi podaci koji se odnose na pojedinca čiji je
                identitet utvrđen ili se može utvrditi. Pojedinac čiji se
                identitet može utvrditi jest osoba koja se može identificirati
                izravno ili neizravno, osobito uz pomoć identifikatora kao što
                su ime, identifikacijski broj, podaci o lokaciji, mrežni
                identifikator ili uz pomoć jednog ili više čimbenika svojstvenih
                za fizički, fiziološki, genetski, mentalni, ekonomski,
                kulturni ili socijalni identitet tog pojedinca.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                ŽIVIĆ- ELEKTRO j.d.o.o. obvezuje se pružati zaštitu osobnim
                podacima kupaca i korisnika usluga na način da prikuplja samo
                nužne, osnovne podatke o kupcima/korisnicima, a koji su nužni za
                ispunjenje naših obveza (podaci o ispunjenju narudžbe); informira
                kupce o načinu korištenja prikupljenih podataka, redovito daje
                kupcima mogućnost izbora o upotrebi njihovih podataka, uključujući
                mogućnost odluke žele li ili ne da se njihovo ime ukloni s lista
                koje se koriste za marketinške kampanje.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Svi se podaci o korisnicima strogo čuvaju i dostupni su samo
                djelatnicima kojima su ti podaci nužni za obavljanje posla. Svi
                djelatnici ŽIVIĆ- ELEKTRO j.d.o.o. i poslovni partneri odgovorni
                su za poštivanje načela zaštite privatnosti.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Prilikom stvaranja korisničkog računa na{" "}
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                od vas se traže pojedini osobni podaci, uključujući ime (naziv),
                adresu, OIB, adresu e-pošte. Adresa e-pošte i lozinka se koristi
                za prijavu na portal. Vaš je račun na{" "}
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                zaštićen korisničkim imenom i lozinkom. Korisničko ime i lozinku
                sustav koristi kako bi provjerio jeste li Vi zaista pretplatnik
                ili korisnik portala.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Plaćanje koje se obavlja isključivo putem otkupa prilikom
                preuzimanja robe od predstavnika kurirske službe ako ste fizička
                osoba, dok tvrtke i obrtnici mogu platiti transakcijski putem
                virmana po definiranim uvjetima iz kupoprodajnih ugovora. Sve
                cijene na{" "}
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                su iskazane sa uračunatim PDV-om. Cijena prijevoza odnosno
                dostave se prikazuje u konačnom zbiru.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Kupac prihvaćanjem ovih uvjeta kupnje jamči da su uneseni
                podatci o naručitelju istiniti i ažurni. Sukladno čl. 10. Zakona
                o zaštiti potrošača, potrošači mogu uložiti pisani prigovor putem
                elektronske pošte.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Kad komunicirate s nama putem e-pošte, telefona ili osobno,
                možemo prikupiti osobne podatke kao što su Vaše ime, adresa,
                broj telefona, adresa e-pošte i preferencije za kontaktiranje.
                Također možemo izraditi zapisnike događaja korisne za
                dijagnosticiranje problema u radu portala te spremati informacije
                u vezi sa nastalim problemom ili problemom podrške. Te podatke
                koristimo kako bismo Vam pružili bolju podršku. Vašem računu
                možemo pristupiti kako bi nam pomogao da vam pružimo potrebnu
                pomoć.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Vaše osobne podatke možemo upotrebljavati kako bismo komunicirali
                s Vama, uključujući komunikaciju o Vašem računu ili transakcijama
                prema nama, kako bismo Vam osigurali važne informacije o
                proizvodima, slali obavijesti o pretplati te za marketinšku
                korespondenciju. Možemo upotrebljavati Vaše osobne podatke kako
                bismo Vam slali marketinšku korespondenciju (uključujući poruke
                e-pošte) povezanu s proizvodima ili uslugama u skladu mogućim s
                Vašim preferencijama za e-poštu u „Moj račun“.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Osobne podatke ne dijelimo s trećim stranama za marketinške
                potrebe trećih strana, a ako ne želite primati marketinšku
                korespondenciju kliknite na poveznicu “Odjava s newsletter-a” u
                bilo kojoj marketinškoj poruci e-pošte koju primite od naše
                tvrtke.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Možemo upotrebljavati osobne podatke za interne statističke,
                marketinške ili operacijske svrhe, uključujući stvaranje
                izvještaja o prodaji, interesa korisnika, sklonosti kupnji i
                drugih trendova koji se odnose na naše kupce.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Vaše Osobne podatke ne dijelimo drugim tvrtkama ili osobama.
                Vaši se osobni podaci mogu razotkriti drugim stranama samo uz
                Vaše dopuštenje u obliku koji može biti obavezan sukladno
                važećem zakonu. Sukladno važećim zakonima Vaše Osobne podatke
                možemo razotkriti ako vjerujemo da je to nužno sukladno
                primjenjivom zakonu ili propisu, u sklopu suradnje s pravnim
                procesom, na zahtjev predstavnika zakona.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Prikupljeni osobni podaci se ne dostavljaju trećim osobama niti
                komercijalno eksploatiraju od trećih strana i izvan Republike
                Hrvatske, međutim zadržavamo pravo prijenosa osobnih podataka
                podružnici, ogranku ili trećoj strani u slučaju reorganizacije,
                udruživanja ili ustupanja poslova.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                sadrži dio gdje možete ostaviti komentare pomoću kojeg možete
                objavljivati informacije i poruke. Imajte na umu kako sve
                informacije koje na našem web-mjestu objavite kroz takve usluge
                ili na drugi način mogu postati javne informacije i mogu biti
                dostupne posjetiteljima web-mjesta i široj javnosti. Potičemo
                vas na oprez i diskreciju prilikom objavljivanja osobnih podataka
                ili drugih informacija na našem web-mjestu.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Naše web-mjesto nije namijenjeno pojedincima mlađim od 16 godina
                te zahtijevamo da nam pojedinci mlađi od 16 godina ne dostavljaju
                svoje osobne podatke. Ako doznamo da smo prikupili osobne podatke
                djeteta mlađeg od 16 godina, poduzet ćemo korake da te informacije
                izbrišemo što je prije moguće, a ako znate za korisnika mlađeg od
                16 godina koji se služi našim web-mjestom, obratite nam se u
                rubrici kontakt.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Možda ćemo s vremena na vrijeme mijenjati ovu Izjavu ili uvjete
                korištenja kako dodajemo nove proizvode, usluge i aplikacije ili
                poboljšavamo našu trenutačnu ponudu te kako se tehnologija i
                zakoni mijenjaju. Datum posljednjeg ažuriranja možete pronaći na
                dnu ove stranice. Sve će promjene postati važeće nakon što
                objavimo promjenu na našem web-mjestu. Ako je riječ o materijalnim
                izmjenama, obavijestit ćemo vas o tome i ako je to potrebno
                sukladno primjenjivom zakonu, zatražiti vaše dopuštenje.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Vaše osobne podatke čuvat ćemo tijekom razdoblja potrebnog da se
                ispuni njihova svrha, osim ako je duže čuvanje propisano zakonom.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Za pregled, ispravak, ažuriranje svojih osobnih podataka, svojim
                osobnim podacima možete pristupiti u „Moj račun“ na glavnom
                izborniku nakon prijave te ih izmijeniti. Također možete zatražiti
                brisanje ili ažuriranje Vaših Osobnih podataka i računa putem
                rubrike „Kontakt“ ili dopisom na službenom papirom poštom.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Sukladno važećem zakonu brzo ćemo odgovoriti na Vaše zahtjeve,
                zbog Vaše zaštite, možemo provesti samo zahtjeve koji se odnose
                na osobne podatke, a povezani su s određenom adresom e-pošte koju
                ste uporabili za slanje zahtjeva, možda ćemo morati provjeriti
                Vaš identitet prije provođenja zahtjeva. Možemo odbiti provođenje
                zahtjeva koji ugrožavaju privatnost drugih strana, iznimno su
                nepraktični ili bismo u njihovom ispunjavanju učinili nešto što
                nije dopušteno primjenjivim zakonima.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Uz to, u mjeri u kojoj je to dopušteno važećim zakonima, možda
                ćemo trebati neke osobne podatke čuvati tijekom dužeg vremena za
                potrebe arhiviranja, poput čuvanja zapisnika o vašim kupnjama za
                potrebe jamstva ili računovodstva.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Osobni podaci su zaštićeni i čuvaju se dostupnim tehnologijama i
                procesima. Zahtjeve za pristup, ispravljanje ili brisanje osobnih
                podataka možete uputiti na našoj stranici za kontakt.
              </p>
            </section>

            {/* IZJAVA O KOLAČIĆIMA */}
            <section className="mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-cyan-300">
                Izjava o &quot;kolačićima&quot;
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Internet stranica{" "}
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                koristi kolačiće (eng. “cookies”) kako bi korisniku pružili
                uslugu s potpunim funkcionalnostima. Kolačići su skup podataka
                koje generira poslužitelj web stranica i koje web preglednik
                sprema na disk korisnika u obliku male tekstualne datoteke.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Sesijski kolačić se postavlja na računalo posjetitelja Internet
                stranice{" "}
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                samo za vrijeme trajanja posjeta našoj Internet stranici kako bi
                se korisniku omogućila učinkovitija uporaba{" "}
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                i automatski istječe kada se zatvori preglednik.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                prate statističku posjećenost radi dobivanja nužne informacije o
                privlačnosti i uspješnosti svojih stranica na tržištu. Za to se
                koristi usluga treće strane pod nazivom Google Analytics. Više o
                tome te regulaciji kolačića koji su za to nužni, može se vidjeti
                na:{" "}
                <a
                  href="http://www.google.com/intl/en/analytics/privacyoverview.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
                >
                  http://www.google.com/intl/en/analytics/privacyoverview.html
                </a>
                .
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Internet stranica{" "}
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                može koristiti kolačiće u svrhu oglašavanja vlastitih usluga ili
                usluga i proizvoda svojih partnera. To se prikazivanje oglasa
                omogućuje putem kolačića.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Svi korisnici Internet stranice{" "}
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                u svakom trenutku mogu samostalno urediti primanje kolačića putem
                postavki svojeg Internet-preglednika.{" "}
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                isključuje svaku odgovornost za bilo kakav gubitak
                funkcionalnosti i/ili kvalitete sadržaja u svim slučajevima
                odabira regulacije primanja kolačića od strane korisnika.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Korištenjem Internet stranice{" "}
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                smatra se da su korisnici u svakom trenutku upoznati i suglasni
                s ovim uvjetima korištenja, uključujući s odredbama o obradi
                podataka i mogućnostima u vezi s kolačićima.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                može prikupljati određene podatke o Korisnicima tijekom
                pristupanja / korištenja{" "}
                <span className="font-medium text-slate-100">
                  www.zivic-elektro.shop
                </span>{" "}
                (IP adresa, session-cookie, ključne riječi korištene kod
                pretraživanja i sl.), koje koristi za analizu ponašanja
                Korisnika i rada sustava, kako bi poboljšao rad i funkcionalnost
                web stranice i njegove sadržaje dodatno usmjerio i prilagodio
                Korisnicima.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                Pružatelj usluge se obvezuje da će u dobroj namjeri koristiti
                podatke pribavljene od Korisnika, te da pribavljene podatke neće
                distribuirati trećim osobama. Kupac i korisnik prihvaćanjem
                ovih uvjeta korištenja i kupnje jamči da je upoznat sa zaštititom
                i prikupljanjem “kolačića”, svojih osobnih podataka te njihovom
                korištenju, daje svoju privolu i suglasnost za navedeno
                korištenje.
              </p>
            </section>

            {/* UVJETI KORIŠTENJA – 1–5 */}
            <section className="mt-8 space-y-4">
              <h2 className="text-lg font-semibold text-cyan-300">
                Uvjeti korištenja
              </h2>

              {/* 1. Pružatelj usluge */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-cyan-500">
                  1. Pružatelj usluge
                </h3>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                  Živić-elektro j.d.o.o., 204. Vukovarske brigade 39, 32000
                  Vukovar, OIB: 90344764519 (dalje: Pružatelj usluge) svojim
                  korisnicima omogućuje korištenje sadržaja Internet stranice na
                  internetskoj domeni{" "}
                  <span className="font-medium text-slate-100">
                    www.zivic-elektro.shop
                  </span>
                  , koje je regulirano ovim Uvjetima korištenja (dalje Uvjeti
                  korištenja).
                </p>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                  Korisnikom se smatra svaka osoba koja pristupa i/ili koristi
                  stranice{" "}
                  <span className="font-medium text-slate-100">
                    www.zivic-elektro.shop
                  </span>
                  , bez obzira koristi li besplatne stranice ili stranice za koje
                  je potrebna prijava s korisničkim imenom i lozinkom/zaporkom
                  (dalje: Korisnik).
                </p>
              </div>

              {/* 2. Opće odredbe */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-cyan-500">
                  2. Opće odredbe
                </h3>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                  Pristupanjem i/ili korištenjem bilo kojeg dijela sadržaja ili
                  servisa koji pripadaju{" "}
                  <span className="font-medium text-slate-100">
                    www.zivic-elektro.shop
                  </span>{" "}
                  smatra se da je Korisnik upoznat s ovim Uvjetima korištenja te
                  da ih u potpunosti razumije i prihvaća. Pružatelj usluge
                  zadržava pravo promjene izgleda, sadržaja i opsega{" "}
                  <span className="font-medium text-slate-100">
                    www.zivic-elektro.shop
                  </span>
                  , svih usluga, stranica i podstranica koje su sastavni dio
                  stranice kao i ovih Uvjeta korištenja.
                </p>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                  Pri korištenju{" "}
                  <span className="font-medium text-slate-100">
                    www.zivic-elektro.shop
                  </span>{" "}
                  Korisnik je u cijelosti dužan poštovati relevantne odredbe
                  ugovora o zasnivanju pretplatničkog odnosa te ovih Uvjeta
                  korištenja. Niti jedan dio sadržaja stranice ne smije se
                  koristiti u nezakonite svrhe ili protivno odredbama ovih Uvjeta
                  korištenja.
                </p>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                  Tekstovi objavljeni u bazama znanja predstavljaju autorstvo.
                  Pružatelj usluge ne preuzima odgovornost za bilo kakvu štetu
                  nastalu korisnicima korištenjem{" "}
                  <span className="font-medium text-slate-100">
                    www.zivic-elektro.shop
                  </span>{" "}
                  i njegovog sadržaja, osobito zbog mogućih pogrešaka u
                  prijepisu mišljenja.
                </p>
              </div>

              {/* 3. Opseg korištenja i prava intelektualnog vlasništva */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-cyan-500">
                  3. Opseg korištenja i prava intelektualnog vlasništva
                </h3>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                  Korisnici su upoznati sa sljedećim činjenicama: zbirke
                  dokumenata i pojedinačni dokumenti koji su sastavni dio
                  sadržaja{" "}
                  <span className="font-medium text-slate-100">
                    www.zivic-elektro.shop
                  </span>{" "}
                  mogu biti u cijelosti ili pojedinačno zaštićeni autorskim
                  pravom i drugim propisima. Pojedinačne jedinice, koje su dio
                  sadržaja stranice, mogu imati značaj autorskog djela te su
                  zaštićene autorskim pravom njihovog autora.
                </p>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                  Autorska zaštita sadržaja, njegovih pojedinačnih zbirki podataka
                  (baza znanja) i pojedinačnih jedinica u zbirkama, obuhvaća
                  zaštitu u skladu sa Zakonom o autorskom pravu i drugim srodnim
                  pravima. Korisniku je dopušteno korištenje pojedinačnih jedinica
                  objavljenih na stranici isključivo za vlastite potrebe.
                </p>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                  Svi oblici daljnje distribucije bilo kojeg dijela{" "}
                  <span className="font-medium text-slate-100">
                    www.zivic-elektro.shop
                  </span>{" "}
                  te umnožavanje, kopiranje odnosno omogućavanje korištenja
                  trećim osobama (npr. reproduciranje u publikacijama, objava na
                  internet stranicama trećih osoba i sl.), izričito su zabranjeni.
                </p>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                  Pružatelj usluge polaže autorska prava na vlastite sadržaje
                  (tekstualne sadržaje, grafičke, baze podataka, programski kod i
                  dr.). Neovlašteno korištenje bilo kojeg dijela ovih sadržaja
                  smatra se kršenjem autorskih i drugih prava Pružatelja usluge i{" "}
                  <span className="font-medium text-slate-100">
                    www.zivic-elektro.shop
                  </span>
                  .
                </p>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                  Korisnik odgovara Pružatelju usluge za štetu koja Pružatelju
                  usluge nastane kršenjem odredbi ove glave Uvjeta korištenja, tj.
                  u njemu sadržanih obveza odnosno ograničenja.
                </p>
              </div>

              {/* 4. Postupak s korisničkim imenom i lozinkom */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-cyan-500">
                  4. Postupak s korisničkim imenom i (lozinkom) zaporkom
                </h3>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                  Korisnik se obvezuje da će dodijeljenu zaporku čuvati kao
                  poslovnu tajnu te da će zaporku koristiti samo osobno, tj. da
                  iste neće učiniti dostupnima trećim osobama. Korisnik je
                  odgovoran Pružatelju usluge za štetu nastalu pri zloporabi
                  zaporke od strane neovlaštenog korisnika odnosno treće osobe
                  kojoj je omogućio korištenje istima.
                </p>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                  Korisnik je obvezan u slučaju saznanja za činjenice koje ukazuju
                  na mogućnost zloporabe zaporke, bez odgode obavijestiti
                  Pružatelja usluge. U slučaju kršenja odredaba Uvjeta korištenja
                  Pružatelj usluge ima pravo ograničiti ili onemogućiti uporabu
                  sadržaja{" "}
                  <span className="font-medium text-slate-100">
                    www.zivic-elektro.shop
                  </span>
                  .
                </p>
              </div>

              {/* 5. Povezanost na druge internet stranice */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-cyan-500">
                  5. Povezanost na druge internet stranice
                </h3>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                  <span className="font-medium text-slate-100">
                    www.zivic-elektro.shop
                  </span>{" "}
                  može sadržavati i poveznice na druge internet stranice, koje
                  nisu održavane od strane društva. Pružatelj usluge za sadržaj
                  tih stranica ne odgovara.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}