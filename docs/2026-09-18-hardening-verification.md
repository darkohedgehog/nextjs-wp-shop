# Lokalne popravke i provere — 18.09.2026.

## Implementirano

- WordPress potvrđuje identitet iz HttpOnly `wpToken` cookie-ja. Email cookie, lokalni profil i query/body customer ID ne daju pravo pristupa.
- GET/PUT kupca i lista narudžbi zahtevaju vlasnika. Pojedinačna narudžba dostupna je vlasniku ili putem tačnog order key-a. Odgovori su minimalni i `private, no-store`.
- Checkout validira artikle, količine, adresu, metode plaćanja, raspoloživost i zbirnu zalihu varijanti. Prosleđuje samo dozvoljena polja. Klijentski iznosi i dostava se odbacuju. Neuspešno dohvatanje cene prekida zahtev.
- B2B grupa se izvodi iz potvrđenog kupca. Isti obračun koristi lista proizvoda, detalj i narudžba; ispravljen je slučaj kada grupa ima samo redovnu cenu.
- Login ne vraća token pregledniku; logout briše stare cookies i browser token ključeve. GraphQL služi javnom katalogu, personalizacija ide kroz potvrđene REST rute.
- Registracija koristi HTTPS Authorization header umesto ključeva u URL-u. Uvedeni timeouti i neutralne greške; uklonjeno logovanje emaila i sirovih Woo grešaka iz izmenjenih ruta.
- Metadata cache važi samo tokom rendera; slike product kartica se učitavaju odloženo.
- Sanitizovan WordPress HTML (proizvod, FAQ, blog), escapovan JSON-LD. Nova biblioteka `sanitize-html` izabrana je zbog parsiranja HTML-a i dozvoljenih tagova/atributa; regex nije zamena za sanitizer. Dokumentacija: https://github.com/apostrophecms/apostrophe/tree/main/packages/sanitize-html
- Ikone u footeru imaju pristupačna imena; uklonjeni opšti Facebook link i administratorski Messenger inbox, jer javno odredište firme nije potvrđeno.
- Cookie dijalog podržava tastaturu i Escape. Nema tvrdnje da sam dijalog predstavlja kompletnu pravnu saglasnost ili blokiranje svih spoljnih resursa.
- Cjenik prelazi na javni WordPress endpoint ako interna adresa nije dostupna (localhost nema servis na portu 8080); nijedna konfiguraciona datoteka nije menjana. Browser sada prikazuje „Cjenik još nije objavljen”, usklađeno sa javnim manifestom koji ima 0 publikacija.
- Sidrena cena i datum se prikazuju na detalju proizvoda ako plugin vrati validan `recorded` podatak. Postojeći WordPress plugin nije menjan.

## Sačuvana poslovna pravila

Korisnik je potvrdio COD `processing` + `set_paid=true`, BACS `processing` + `set_paid=false` i postojeću B2B registraciju/grupu. Admin odobravanje B2B kupca ostaje na WordPress strani. Kartično plaćanje nije menjano ni pokretano.

## Provere

- 31 automatizovani test: 17 pomoćnih funkcija/ugovora i 14 testova stvarnih route handlera/server funkcija sa zatvorenim memorijskim WordPress transportom. Obuhvaćeni pozitivni i negativni pristup, podmetnuti iznosi, količine, B2B cene, grupna dostava, roditeljska zaliha varijanti, backorders, nedostupni artikli i upstream greške. Nema stvarnih upisa ni emailova.
- Vizuelno na localhostu: `wifi-smart-vanjska-kamera` prikazuje sidrenu cenu **60,00 € na dan 10.09.2026.** i aktuelnu cenu 60,00 €. Opis ostaje vidljiv posle sanitizacije. Dodavanje u košaricu prikazuje 60,00 € + 5,50 € dostave = 65,50 €. Cookie dijalog se otvara i zatvara Escape tasterom.
- Korisnik je potvrdio ponovno prijavljivanje stvarnim B2C nalogom i otvaranje narudžbi. Identifikatori kupca nisu uključeni u ovaj izveštaj.
- Nezavisan pregled popravke: dopunjena provera zajedničke roditeljske zalihe i regresioni testovi.
- `npm audit`: 0 ranjivosti. Lint i TypeScript prolaze. Izolovani produkcijski build prolazi uz lokalni GraphQL fixture; sitemap/postbuild nije pokretan.

## Još nije potvrđeno na stvarnom WooCommerce-u

- B2B prijava/cene i porez/zaokruživanje u novoj narudžbi; stvarne varijante, backorders i WordPress dodaci koji menjaju obračun. Testovi transporta ne dokazuju backend plugin ponašanje.
- Nije kreirana stvarna narudžba, menjana lozinka ili registrovan kupac. Checkout UI nije dokaz izvršene kupovine.
- CSV nije objavljen; obavezni parametri i istorijske vrednosti ostaju preduslov za objavu. Zakonski obuhvat nije predmet ovih tehničkih provera.
- Kartični handler i njegovi redirecti su izvan lokalnog koda. Lokalni popravak COD/BACS nije dokaz sigurnosti tog toka.
- Nema commita, pusha ni deploya. Postojeće lokalne izmene sa prethodne faze su sačuvane.

## Naknadna provera pouzeća i animacije

Korisnik je potvrdio da je na localhostu poslao narudžbu pouzećem i da je stiglo email obaveštenje. To je ručna potvrda tog toka; ne predstavlja proveru B2B ili kartičnog toka.

Prijavljeni `Buffer size mismatch: got 197820, expected 196560` potiče iz dotLottie `_draw()` funkcije. Reprodukovan je bez narudžbe, istom animacijom u kontejneru širine 180 px pri render devicePixelRatio=1.75. Automatska visina prati zaokruženu veličinu canvas-a: visina pada sa 90 na 89.140625 CSS px, a canvas sa 157 na 156 piksela dok renderer zadržava prethodni buffer. Pri DPR=1.25 javlja se ekvivalentno upozorenje.

`LottieAnimation.tsx` sada daje omotaču eksplicitan odnos stranica 2:1, što zadržava postojeći izgled i prekida povratnu vezu između unutrašnje rezolucije canvas-a i visine rasporeda. Browser provera pri DPR=1, 1.25, 1.75 i 2: sve četiri animacije vidljive, CSS dimenzije 180×90, bez novih warning/error poruka. Privremena reprodukciona stranica je uklonjena. TypeScript i ciljani ESLint prolaze. Checkout i bibliotečke verzije nisu menjani ovom popravkom.

## Produkcijska regresija: 403 na javnim POST rutama

Prijava, registracija i zahtev za reset lozinke na `https://www.zivic-elektro.shop` odbijani su zajedničkim `checkMutation` poređenjem Origin zaglavlja sa `req.nextUrl.origin`. Direktna read-only dijagnostika praznim login payloadom potvrdila je aplikacijski odgovor `403 / Zahtjev nije dopušten.` bez slanja kredencijala ili pozivanja Woo upisa. Direktni localhost testovi nisu pokrili javni HTTPS origin naspram interne HTTP adrese iza proxyja.

Popravka eksplicitno dozvoljava HTTPS origin webshopa sa i bez `www`. Origin trenutne Next.js adrese dodatno je dozvoljen samo van produkcije. Ne veruje se proizvoljnim Host/X-Forwarded zaglavljima; `Sec-Fetch-Site: cross-site` i dalje se odbija. Nema izmene autentifikacije tokena ni isključivanja zaštite.

Dva nova regresiona testa pre popravke padaju, a posle nje prolaze: javne domene kroz interni proxy stižu do validacije polja na sve tri rute, bez upstream poziva; lažni domeni, HTTP origin, produkcijski localhost origin i lažirana proxy zaglavlja ne dobijaju pristup. Ukupno 33 testa, TypeScript i lint prolaze. Stvarna prijava/reset/registracija zahtevaju ponovnu proveru nakon objave ove ispravke.
